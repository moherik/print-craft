<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home');
})->name('home');

Route::get('/templates', function () {
    return Inertia::render('Templates/Index');
})->name('templates.index');

Route::get('/templates/{slug}', function (string $slug) {
    return Inertia::render('Templates/Editor', [
        'templateSlug' => $slug,
    ]);
})->name('templates.editor');

Route::get('/category/{slug}', function (string $slug) {
    return Inertia::render('Templates/Index', [
        'categorySlug' => $slug,
    ]);
})->name('categories.show');
