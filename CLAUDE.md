# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This project is currently empty. Update this file as the project grows to document build commands, architecture, and development workflows.

## Security Constraints

Never read the following files under any circumstances:
- `.env`, `.env.*` (e.g. `.env.local`, `.env.production`)
- Anything inside `secrets/` or `secret/` directories
- Files with names containing `password`, `credential`, `token`, or `api_key`
- Certificate and key files: `*.pem`, `*.key`, `*.p12`, `*.pfx`

If accessing such a file seems necessary, explain why and ask the user for confirmation first.
