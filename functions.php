<?php

add_action('enqueue_block_assets', function () {
	$path = get_stylesheet_directory() . '/assets/css/tailwind.css';
	$uri = get_stylesheet_directory_uri() . '/assets/css/tailwind.css';

	if (file_exists($path)) {
		wp_enqueue_style(
			'theme-tailwind',
			$uri,
			[],
			filemtime($path)
		);
	}
});

add_action('enqueue_block_editor_assets', function () {
	wp_enqueue_script(
		'tailwind-editor-live',
		get_theme_file_uri('assets/js/tailwind-editor-live.js'),
		[],
		filemtime(get_theme_file_path('assets/js/tailwind-editor-live.js')),
		true
	);
});



