#!/bin/bash

dirOut="$HOME/workspace/jsdoc/"
files="api instructions/implementation"
cssFile="../jsdoc.css"

mkdir "$dirOut" 2>/dev/null
jsdocFileOut="$dirOut/symbols/_global_.html"
for file in $files; do
	jsdoc -d="$dirOut" -q -s "$HOME/workspace/js/$file.js" >/dev/null
	fileOut="$dirOut/$(basename $file).html"
	firstLine="$(grep "====== methods summary =====" "$jsdocFileOut" -n | cut -d: -f1)"
	lastLine="$(grep "====== event details =====" "$jsdocFileOut" -n | cut -d: -f1)"
	echo "<html><head><title></title><link rel="stylesheet" type="text/css" href=\"$cssFile\" /></head><body>" > "$fileOut"
	sed -n "$firstLine","$lastLine"p "$jsdocFileOut" >> "$fileOut"
	echo "</body></html>" >> "$fileOut"
done

rm -rf "$dirOut/index.html" "$dirOut/files.html" "$dirOut/symbols/"
