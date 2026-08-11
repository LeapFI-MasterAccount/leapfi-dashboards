#!/bin/zsh
# Double-click this file to publish every dashboard in ./src to the web.
cd "$(dirname "$0")"
echo "Publishing LeapFI dashboards..."
echo ""
python3 publish.py --push
status=$?
echo ""
if [ $status -eq 0 ]; then
  echo "Done. Your dashboards are updating live now (allow ~1-2 minutes)."
  echo "The embedded Google Sites pages refresh themselves - nothing else to do."
else
  echo "Something went wrong (exit $status). Read the messages above."
fi
echo ""
echo "You can close this window."
