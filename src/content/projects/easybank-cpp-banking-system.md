---
title: EasyBank
summary: An offline C++17 banking-workflow simulator demonstrating account state, transactional ledgers and persistent storage.
year: '2026'
category: Systems Programming / C++
role: C++ workflow implementation and local persistence
status: Published
order: 7
featured: false
tech:
- C++17
- SQLite
- Transactions
- SQL
- Windows Console
- MSVC
- PBKDF2
cover: /projects/cached/easybank-cpp-banking-system/01-main-menu.png
gallery:
- /projects/cached/easybank-cpp-banking-system/02-admin-overview-and-directory.png
- /projects/cached/easybank-cpp-banking-system/03-customer-dashboard.png
- /projects/cached/easybank-cpp-banking-system/04-transfer-confirmed.png
- /projects/cached/easybank-cpp-banking-system/05-transaction-statement.png
liveUrl: ''
repoUrl: https://github.com/Tafseer-ibn-Abbas/easybank-cpp-banking-system
---

## The problem

An educational banking workflow is a useful way to practice handling state carefully. Deposits, withdrawals and transfers must keep balances and transaction histories consistent even when operations fail.

## The implementation

EasyBank is an **offline console-based simulator** written in **C++17** with **SQLite** persistence. It models fictional savings/checking accounts, account sign-in, deposits, withdrawals, transfers, transaction history and an administrative workspace.

Monetary amounts are stored using integer cents rather than floating-point values. Account balance changes and their ledger entries are grouped into database transactions. Password handling uses per-user salted PBKDF2-HMAC-SHA256 hashes, and the app includes simple account locking and interest-credit rules.

## Engineering decisions

- Local database persistence without a web service.
- Atomic balance and ledger updates, with rollback on failure.
- Parameterized SQL and explicit account-state checks.
- Self-test support and a repeatable Windows build/run script.
- User-focused terminal flows for account and administrator actions.

## Outcome and scope

A testable **educational banking simulator**, not a real bank, real-money transfer service, secure commercial financial platform or windowed GUI. The public portfolio version uses SQLite; other classroom versions are not presented as this release.
