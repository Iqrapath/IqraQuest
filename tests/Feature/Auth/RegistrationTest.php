<?php

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertStatus(200);
});

test('new users can register', function () {
    $response = $this->from(route('register'))->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'Password1Test',
        'password_confirmation' => 'Password1Test',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('register'));
    $response->assertSessionHas('success');
});
