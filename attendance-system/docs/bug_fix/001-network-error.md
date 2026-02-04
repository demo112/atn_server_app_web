# Bug Fix: Network Error on Attendance Application

## Issue Description
User reported "Network Error" when submitting attendance application in the App.
Error: `[ERROR] AxiosError: Network Error`

## Analysis
1. Checked running processes: Server was not running.
2. Checked App configuration: `packages/app/src/utils/request.ts` uses `http://10.0.2.2:3000/api/v1` (correct for Android Emulator).

## Resolution
Started the backend server using `pnpm --filter @attendance/server dev`.

## Verification
Server started successfully on port 3000.
