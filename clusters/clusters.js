(function() {
	var $section = $('#cluster-modal');
	$section.find('.panzoom').panzoom({
		$zoomIn: $section.find(".zoom-in"),
		$zoomOut: $section.find(".zoom-out"),
		$zoomRange: $section.find(".zoom-range"),
		$reset: $section.find(".reset"),
		startTransform: 'scale(1.1)',
		increment: 0.1,
		minScale: 0.5,
		contain: 'automatic'
	}).panzoom('zoom');
})();
