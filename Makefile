# Use `gulp` after installing gulp-concat gulp-cli gulp-autoprefixer gulp-html-replace.
all: .npm 
	./node_modules/.bin/gulp

.npm:
	npm install && touch .npm


