---
title: LibraryDesk
summary: A Windows Forms library application for tracking book records, issue/return workflows and overdue loans.
year: '2026'
category: Desktop Application / C#
role: Windows application development and local data persistence
status: Published
order: 6
featured: false
tech:
- C#
- .NET Framework
- Windows Forms
- XML
- Visual Studio
- Desktop UI
cover: /projects/cached/librarydesk-winforms/01-main-dashboard.png
gallery:
- /projects/cached/librarydesk-winforms/02-admin-workspace.png
- /projects/cached/librarydesk-winforms/03-catalog-search.png
- /projects/cached/librarydesk-winforms/04-browse-and-borrow.png
liveUrl: https://github.com/Tafseer-ibn-Abbas/librarydesk-winforms/releases/tag/v1.0.0
repoUrl: https://github.com/Tafseer-ibn-Abbas/librarydesk-winforms
---

## The problem

A library's day-to-day operations require accurate visibility into which books are available, borrowed or overdue, with a straightforward way to manage the book catalog and lending records.

## The solution

LibraryDesk is a **C# Windows Forms** application with dashboard summaries, add/search/remove book operations, book issue and return flows, borrower details and automatic 14-day due dates. The program stores its records locally using XML so data survives restarts.

## Engineering focus

- Event-driven Windows desktop interface design.
- C# object-oriented application state and model updates.
- Search and borrowing flows with due-date calculations.
- Persistent local records and packaging a downloadable Windows executable.

## Outcome and availability

The **v1.0.0 Windows application** is available from GitHub Releases, with screenshots documenting actual desktop screens. It is a functional portfolio application and educational demonstration, not a production-grade multi-user institutional library system. The published edition's persistence is XML, not SQL Server.
