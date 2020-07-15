var images = [];

function shuffle(array) {
    // https://javascript.info/task/shuffle
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function debounce(context = this, func, wait, immediate) {
    https://davidwalsh.name/javascript-debounce-function
	var timeout;
	return function() {
		var args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

var imageContainer = document.querySelector('.imageContainer');

Vue.directive('scroll', {
    inserted: function (el, binding) {
        let f = function (evt) {
        if (binding.value(evt, el)) {
            window.removeEventListener('scroll', f)
        }
        }
        window.addEventListener('scroll', f)
    }
});

document.getElementById('import').onclick = function() {
	var files = document.getElementById('selectFiles').files;
  console.log(files);
  if (files.length <= 0) {
    return false;
  }
  
  var fr = new FileReader();
  
  fr.onload = function(e) { 
  console.log(e);
    var result = JSON.parse(e.target.result);
    var formatted = JSON.stringify(result, null, 2);
        
    document.getElementById('result').value = formatted;
    images = shuffle(result);
  }

  fr.readAsText(files[0]);
};

document.getElementById('start').onclick = function() {
    if (!images || !images.length) {
        alert('No images');
        return;
    }

    document.querySelector('.menu').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    new Vue({
        el: '#app',
        data: {
            images: images,
            loadedImagesCount: 10,
            shouldShowOverlay: false,
            overlaySrc: '',
            overlayOrientation: '',
        },
        methods: {
            addImages() {
                this.loadedImagesCount += 6;
            },
            scrollHandler: () => {}, // real method in 'created' hook,
            showOverlay(clickEvent) {
                this.overlaySrc = clickEvent.currentTarget.firstElementChild.src;
                this.overlayOrientation = clickEvent.currentTarget.firstElementChild.dataset.overlayorientation;
                this.shouldShowOverlay = true;
            },
            hideOverlay() {
                this.shouldShowOverlay = false;
                this.overlaySrc = '';
                this.overlayOrientation = '';
            },
            getImageOrientation(imageLink, isRetrying = false) {
                var domImage = document.querySelector(`[src="${imageLink}"]`);
                if (!domImage & !isRetrying) {
                    setTimeout(function () {
                        this.getImageOrientation(imageLink, true);
                    }.bind(this), 1000);
                    return '';
                }
                return domImage.naturalHeight > domImage.naturalWidth ? 'vertical' : 'horizontal';
            },
            getOverlayOrientation(imageLink,  isRetrying = false) {
                var domImage = document.querySelector(`[src="${imageLink}"]`);
                if (!domImage & !isRetrying) {
                    setTimeout(function () {
                        this.getOverlayOrientation(imageLink, true);
                    }.bind(this), 1000);
                    return '';
                }
                return domImage.naturalHeight / domImage.naturalWidth > document.body.clientHeight / document.body.clientWidth ? 'vertical' : 'horizontal';
            }
        },
        computed: {
            loadedImages() {
                return this.images ? this.images.slice(0, this.loadedImagesCount) : [];
            },
            showAddImageButton() {
                return this.images ? this.images.length > this.loadedImagesCount : false;
            }
        },
        created() {
            this.scrollHandler = debounce(this, function () {
                if (document.documentElement.scrollHeight - window.scrollY - window.innerHeight < 200) {
                    this.addImages();
                }
            }, 100);
        },
    });
};
