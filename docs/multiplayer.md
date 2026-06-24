# multiplayer.js — PeerJS peer-to-peer network

## Purpose
All network code: peer creation, connection setup, data sending, and incoming message dispatch.
Only active when `G.gameMode === 'multiplayer'`. Safe to ignore for single-player/campaign.

## Exports (globals)
| Name | Description |
|---|---|
| `peer` | PeerJS Peer instance |
| `conn` | Active DataConnection to the opponent |
| `sendData(data)` | Sends a packet; auto-appends `data.energy = G.energy` for sync |
| `initializePeer()` | Creates peer with short random ID, wires incoming connection |
| `connectToPeer(remoteId)` | Connects to opponent by ID (client side) |
| `setupConnectionHandlers(isHost)` | Wires conn events: open, data, close |

---

## G properties used by this module
| Property | Read | Write |
|---|---|---|
| `G.energy` | ✓ | — (appended to every sendData) |
| `G.aiEnergy` | — | ✓ (updated from opponent's energy in packets) |
| `G.isNetworkReceiver` | ✓ | ✓ |
| `G.networkPointData` | ✓ | ✓ |
| `G.pPts`, `G.aPts`, `G.pSets`, `G.aSets` | — | ✓ (from POINT_END) |
| `G.nextServer` | — | ✓ (from POINT_END) |
| `G.gameMode` | ✓ | — |
| `G.isHost` | ✓ | — |

---

## Message protocol
Every outbound message auto-gets `data.energy = G.energy` via `sendData()`.

| type | Sender | Payload | Handler action |
|---|---|---|---|
| `PLAY_CARD` | either | `cardId` | Find card, simulate AI play |
| `REROLL` | either | — | Energy sync only |
| `SETTING_PLAY` | either | `cardId` | Advance phase to attack |
| `PASS_BALL` | either | `forced` | `passBall(forced, false)` |
| `SERVICE_ERROR` | either | `errorType: 'out'\|'net'` | Log + endPoint |
| `SERVICE_SUCCESS` | either | `power` | `startDefenseWindow(true)` |
| `ATTACK` | either | `power, cardId` | `startDefenseWindow(false)`, set `G.aiAtkPow` |
| `BLOCK_SKIPPED` | either | — | `startDefenseWindow(false)` |
| `BLOCK_RESULT` | either | `cardId, resultType` | See block results table below |
| `DEFENSE_SUCCESS` | either | `defPow, quality, gap` | Simulate AI got defense → their turn |
| `DEFENSE_FAIL` | either | `defPow, quality, gap` | `endPoint('win', ...)` |
| `POINT_END` | **host only** | `winnerRole, hostPts, clientPts, hostSets, clientSets, nextServerRole, reason` | Apply absolute scores, `endPoint()` |

### BLOCK_RESULT resultTypes
| resultType | Action |
|---|---|
| `POINT_DIRECT` | endPoint win (blocker wins) |
| `OUT` | endPoint loss (block goes out) |
| `SOFTEN` | startDefenseWindow(false) with halved power |
| `CONTINUE` | AI turn (attacker continues) |

---

## Authoritative scoring (POINT_END)
- Only the **host** sends `POINT_END`
- Client receives it → sets `G.isNetworkReceiver = true` → calls `endPoint()` without re-sending
- Client applies absolute scores from packet (not calculated locally)

---

## Connection flow
```
Host: initializePeer() → share ID → opponent connects → setupConnectionHandlers(true)
Client: initializePeer() → connectToPeer(hostId) → setupConnectionHandlers(false)
Both: conn.on('data') dispatches incoming packets
```

---

## Known limitations
- No reconnection on disconnect (DT-05)
- No server-side validation — host controls authoritative scores (DT-08)
- Relies on PeerJS STUN/TURN servers; may fail in restrictive networks
