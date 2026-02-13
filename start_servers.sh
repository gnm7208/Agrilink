#!/bin/bash
cd /home/george/Development/code/phase-5/Agrilink/server
python app.py > ../backend.log 2>&1 &
echo "Backend started"

cd /home/george/Development/code/phase-5/Agrilink/client
npm run dev > ../frontend.log 2>&1 &
echo "Frontend started"
