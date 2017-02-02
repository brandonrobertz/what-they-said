# subtitle format they get pulled in from youtube-dl
IN_FMT=vtt
# final output conversion format
OUT_FMT=srt
DL_CMD=cd ${IN_FMT} && youtube-dl -i --yes-playlist --write-auto-sub --write-sub --sub-lang en --skip-download
BROWSERIFY=./node_modules/browserify/bin/cmd.js

default: dir download convert index bundle

dir:
	mkdir -p ${IN_FMT}
	#rm -rf ${OUT_FMT}
	mkdir -p ${OUT_FMT}

download:
	# youtube-dl outputs all kinds of error codes, even when it does what it should
	# this causes the Makrfile from continuing to the next command, so we have to force
	# exit code zero ...
	# right side broadcasting
	${DL_CMD} https://www.youtube.com/playlist?list=PLuXXbBFpPc0lb4_FdI1NOPTCAYroXOywl || exit 0
	# donald trump speeches and rallies
	${DL_CMD} https://www.youtube.com/playlist?list=PL-NSU9cjYpaHyHPwhvWYq0ooFnuz7f-G0 || exit 0
	# trump tv network - thank you rally
	${DL_CMD} https://www.youtube.com/playlist?list=PLbBZQ-qTn7spy0HwpLl4qFTs5Vm1f-6Uq || exit 0
	# RBC NETWORK BROADCASTING - Donald Trump Speeches & Events
	${DL_CMD} https://www.youtube.com/playlist?list=PLocvq02h-FETPLh3YW5TK5QNbAYkmLKKG || exit 0

convert:
	find ${IN_FMT}/ -name '*.vtt' -exec ffmpeg -n -i '{}' '{}.${OUT_FMT}' \;
	mv -v ${IN_FMT}/*.${OUT_FMT} ${OUT_FMT}/
	#find ./${OUT_FMT}/ -iname '*full*' -exec ./bin/extract.js {} ${LIST_DIR} \;

index:
	./bin/extract.js ./${OUT_FMT}  searchIndex.json

bundle:
	mkdir -p dist
	echo -n 'window.DATA=' > dist/searchIndex.js
	cat searchIndex.json >> dist/searchIndex.json
	${BROWSERIFY} -o ./dist/bundle.js -e ./lib/index.js -d

clean:
	rm -rf ${OUT_FMT}
	rm -rf ${IN_FMT}
	rm -rf dist
