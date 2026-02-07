node -v > node_version.log
call npx vite --version > vite_version.log
call npm run dev > dev_output.log 2>&1
