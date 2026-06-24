# multiplayer.js — PeerJS peer-to-peer network

## Purpose
All network code: peer creation, connection setup, data sending, and incoming message dispatch.

## Exports (globals)
| Name | Description |
|---|---|
| `peer` | PeerJS Peer instance |
| `conn` | Active DataConnection to the opponent |
| `sendData(data)` | Sends a packet; auto-appends `energy` field for sync |
| `initializePeer()` | Creates peer with short random ID, sets up incoming connection handler |
| `connectToPeer(remoteId)` | Connects to opponent by ID (client side) |
| `setupConnectionHandlers(isHost)` | Wires conn events: open, data, close |

## Message protocol
Every message embeds `data.energy = G.energy` for opponent energy mirroring.

| type | Sender | Payload | Description |
|---|---|---|---|
| `PLAY_CARD` | either | `cardId` | Card played by sender |
| `REROLL` | either | — | Card rerolled (−1⚡ info) |
| `SETTING_PLAY` | either | `cardId` | Setting card played (transitions to attack phase) |
| `PASS_BALL` | either | `forced` | Ball passed |
| `SERVICE_ERROR` | either | `errorType: 'out'|'net'` | Serve error type |
| `SERVICE_SUCCESS` | either | `power` | Serve landed |
| `ATTACK` | either | `power, cardId` | Attack launched |
| `BLOCK_SKIPPED` | either | — | Block window skipped |
| `BLOCK_RESULT` | either | `cardId, resultType` | Block outcome (`POINT_DIRECT`, `OUT`, `SOFTEN`, `CONTINUE`) |
| `DEFENSE_SUCCESS` | either | `defPow, quality, gap` | Defense succeeded with quality tier |
| `DEFENSE_FAIL` | either | `defPow, quality, gap` | Defense failed |
| `POINT_END` | host only | `winnerRole, hostPts, clientPts, hostSets, clientSets, nextServerRole, reason` | Authoritative point result |

## Authoritative scoring (POINT_END)
Only the host sends `POINT_END`. The client receives it, applies the absolute scores,
and calls `endPoint()` with `G.isNetworkReceiver = true` to prevent sending a second packet.

## Known limitations (see AGENT.md DT-05, DT-08)
- No reconnection handling on disconnect.
- No server-side validation — host controls authoritative scores.
- Relies on PeerJS STUN/TURN servers; may fail in restrictive networks.
