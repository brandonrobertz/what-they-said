# subtitle format they get pulled in from youtube-dl
IN_DIR=download
# final output conversion format
OUT_FMT=srt
DL_CMD=cd ${IN_DIR} && youtube-dl -i --write-thumbnail --yes-playlist --write-auto-sub --write-sub --sub-lang en --skip-download
BROWSERIFY=./node_modules/browserify/bin/cmd.js

# deploy stuff
SSH_HOST=bxroberts.org
SSH_PORT=22220
SSH_USER=brando
DEPLOY_DIR=wapo209fbb09aac81736
SSH_TARGET_DIR=/var/www/bxroberts.org/public_html/${DEPLOY_DIR}/

default: index data metadata bundle

dir:
	mkdir -p ${IN_DIR}
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
	find ${IN_DIR}/ -name '*.vtt' -exec ffmpeg -n -i '{}' '{}.${OUT_FMT}' \;
	mv -v ${IN_DIR}/*.${OUT_FMT} ${OUT_FMT}/
	#find ./${OUT_FMT}/ -iname '*full*' -exec ./bin/extract.js {} ${LIST_DIR} \;

index:
	rm searchIndex.json
	rm searchIndex.json.videoIds
	./bin/extract.js ./${OUT_FMT}  searchIndex.json

data: index
	cat searchIndex.json > dist/searchIndex.js
	cat searchIndex.json.videoIds > dist/videoIds.js

css:
	cp ./node_modules/react-video/dist/react-video.css ./dist/

metadata:
	mkdir -p dist/metadata
	ls ./dist/metadata
	./bin/metadata.js ./download ./dist/metadata

bundle:
	mkdir -p dist
	NODE_ENV=production ${BROWSERIFY} -o ./dist/bundle.js -t reactify -e ./lib/App.js
	cat ./dist/bundle.js | ./node_modules/uglify-js/bin/uglifyjs -c > ./dist/bundle.min.js

server:
	http-server ./

clean:
	rm -rf ${OUT_FMT}
	rm -rf ${IN_DIR}
	rm -rf dist
	rm -rf metadata

deploy:
	rsync -e "ssh -p $(SSH_PORT)" -P -rvzc --delete-after \
		./ $(SSH_USER)@$(SSH_HOST):$(SSH_TARGET_DIR) \
		--cvs-exclude --exclude=download/ \
		--exclude=node_modules/ --exclude=bin/ \
		--exclude=srt/ --exclude=Makefile \
		--exclude='.*.swp' --exclude='.*.swo' 

.PHONY: download
