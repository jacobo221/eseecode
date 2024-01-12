#!/bin/bash

dirOut="$HOME/eseecode/jsdoc/"
files="api instructions/implementation"
cssFile="../jsdoc.css"

mkdir "$dirOut" 2>/dev/null
jsdocFileOut="$dirOut/symbols/_global_.html"
tempfilename="$(mktemp).js"
for file in $files; do
	echo "Generating $file docs..."
	cat "$HOME/eseecode/js/$file.js" | sed -E 's/^\$e\.api\.([a-zA-Z0-9_]+) = \((.*)\) => \{/function \1(\2) {/' | sed -E 's/^\$e\.api\.([a-zA-Z0-9_]+) = (async )?function /\2function \1/' > "$tempfilename"
	jsdoc -a -d="$dirOut" -q -s "$tempfilename" >/dev/null
	fileOut="$dirOut/$(basename $file).html"
	firstLine="$(grep -E "====== (properties|methods) summary =====" "$jsdocFileOut" -m1 -n | cut -d: -f1)"
	lastLine="$(grep "====== event details =====" "$jsdocFileOut" -n | cut -d: -f1)"
	echo "<html><head><title></title><link rel="stylesheet" type="text/css" href=\"$cssFile\" /></head><body>" > "$fileOut"
	sed -n "$firstLine","$lastLine"p "$jsdocFileOut" >> "$fileOut"
	echo "</body></html>" >> "$fileOut"
	mv -f "$fileOut" "$fileOut".tmp
	sed 's/\.\.\/symbols\/_global_\.html//g' "$fileOut".tmp > "$fileOut"
	rm -rf "$fileOut".tmp
done
rm -rf "$dirOut/index.html" "$dirOut/files.html" "$dirOut/symbols/" "$tempfilename"
