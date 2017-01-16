INITIAL_FMT=vtt
OUT_FMT=srt
DL_CMD=cd ${SUBFMT} && youtube-dl -i --yes-playlist --write-auto-sub --write-sub --sub-lang en --skip-download

default: dir download

dir:
	mkdir -p ${INITIAL_FMT}
	rm -rf ${OUT_FMT}
	mkdir -p ${OUT_FMT}

download:
	# youtube-dl outputs all kinds of error codes, which stop the makefile from continuing
	# right side broadcasting
	${DL_CMD} https://www.youtube.com/playlist?list=PLuXXbBFpPc0lb4_FdI1NOPTCAYroXOywl || exit 0
	# donald trump speeches and rallies
	${DL_CMD} https://www.youtube.com/playlist?list=PL-NSU9cjYpaHyHPwhvWYq0ooFnuz7f-G0 || exit 0
	# trump tv network - thank you rally
	${DL_CMD} https://www.youtube.com/playlist?list=PLbBZQ-qTn7spy0HwpLl4qFTs5Vm1f-6Uq || exit 0
	# RBC NETWORK BROADCASTING - Donald Trump Speeches & Events
	${DL_CMD} https://www.youtube.com/playlist?list=PLocvq02h-FETPLh3YW5TK5QNbAYkmLKKG || exit 0

convert: dir
	find ${INITIAL_FMT}/ -name '*.vtt' -exec ffmpeg -n -i '{}' '{}.${OUT_FMT}' \;
	mv ${INITIAL_FMT}/*.${OUT_FMT} ${OUT_FMT}/
