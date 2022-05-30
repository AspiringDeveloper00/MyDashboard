/*global $, document, window, setTimeout, navigator, console, location*/
$(document).ready(function () {

    'use strict';

    var usernameError = true,
        emailError = true,
        passwordError = true,
        passConfirm = true,
        loginemail = true,
        loginpass = true;

    // Detect browser for css purpose
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        $('.form form label').addClass('fontSwitch');
    }

    // Label effect
    $('input').focus(function () {

        $(this).siblings('label').addClass('active');
    });

    // Form validation
    $('input').blur(function () {

        // User username
        if ($(this).hasClass('username')) {
            if ($(this).val().length === 0) {
                $(this).siblings('span.error').text('Please type your username').fadeIn().parent('.form-group').addClass('hasError');
                usernameError = true;
            } else if ($(this).val().length > 1 && $(this).val().length <= 6) {
                $(this).siblings('span.error').text('Please type at least 6 characters').fadeIn().parent('.form-group').addClass('hasError');
                usernameError = true;
            } else {
                $(this).siblings('.error').text('').fadeOut().parent('.form-group').removeClass('hasError');
                usernameError = false;
            }
        }
        // Email
        if ($(this).hasClass('email')) {
            if ($(this).val().length == '') {
                $(this).siblings('span.error').text('Please type your email address').fadeIn().parent('.form-group').addClass('hasError');
                emailError = true;
            } else {
                $(this).siblings('.error').text('').fadeOut().parent('.form-group').removeClass('hasError');
                emailError = false;
            }
        }

        // Email
        if ($(this).hasClass('loginemail')) {
            if ($(this).val().length == '') {
                $(this).siblings('span.error').text('Please type your email address').fadeIn().parent('.form-group').addClass('hasError');
                loginemail = true;
            } else {
                $(this).siblings('.error').text('').fadeOut().parent('.form-group').removeClass('hasError');
                loginemail = false;
            }
        }

        // PassWord
        if ($(this).hasClass('loginPassword')) {
            if ($(this).val().length == '') {
                $(this).siblings('span.error').text('Please type your password').fadeIn().parent('.form-group').addClass('hasError');
                loginpass = true;
            } else {
                $(this).siblings('.error').text('').fadeOut().parent('.form-group').removeClass('hasError');
                loginpass = false;
            }
        }


        // PassWord
        if ($(this).hasClass('pass')) {
            if ($(this).val().length < 8) {
                $(this).siblings('span.error').text('Please type at least 8 charcters').fadeIn().parent('.form-group').addClass('hasError');
                passwordError = true;
            } else {
                $(this).siblings('.error').text('').fadeOut().parent('.form-group').removeClass('hasError');
                passwordError = false;
            }
        }



        // PassWord confirmation
        if ($('.pass').val() !== $('.passConfirm').val()) {
            $('.passConfirm').siblings('.error').text('Passwords don\'t match').fadeIn().parent('.form-group').addClass('hasError');
            passConfirm = true;
        } else {
            $('.passConfirm').siblings('.error').text('').fadeOut().parent('.form-group').removeClass('hasError');
            passConfirm = false;
        }

        // label effect
        if ($(this).val().length > 0) {
            $(this).siblings('label').addClass('active');
        } else {
            $(this).siblings('label').removeClass('active');
        }
    });


    // form switch
    $('a.switch').click(function (e) {
        $(this).toggleClass('active');
        e.preventDefault();

        if ($('a.switch').hasClass('active')) {
            $(this).parents('.form-peice').addClass('switched').siblings('.form-peice').removeClass('switched');
        } else {
            $(this).parents('.form-peice').removeClass('switched').siblings('.form-peice').addClass('switched');
        }
    });


    // Form submit
    $('form.signup-form').submit(function (event) {
        event.preventDefault();
        if (usernameError == true || emailError == true || passwordError == true || passConfirm == true ) {
            $('.username, .email, .pass, .passConfirm').blur();
        } else {
            signup();
        }
    });


    $('form.login-form').submit(function (event) {
        event.preventDefault();
        if (loginemail == true || loginpass == true) {
            $('.loginemail, .loginPassword').blur();
        } else {
            login();
        }

    });




});


function login() {
    $.ajax({
        data: {
            email: $('#loginemail').val(),
            password: $('#loginPassword').val()
        },
        type: 'POST',
        url: '/login'
    })
        .done(function (data) {
            if (data.error) {
                Swal.fire({
                    icon: 'error',
                    text: data.error
                });
                $('.login').removeClass('switched').siblings('.signup').addClass('switched');

            } else if (data.success) {
                    localStorage['message'] = data.success;
                    $(location).prop('href', 'home')
                
            }
        });

};


function signup() {
    $.ajax({
        data: {
            username: $('#username').val(),
            password: $('#password').val(),
            email: $('#email').val(),
        },
        type: 'POST',
        url: '/signup'
    })
        .done(function (data) {
            if (data.info) {
                Swal.fire({
                    icon: 'info',
                    text: data.info
                });
            } else if (data.success) {
                localStorage['message'] = data.success;
                $(location).prop('href', 'home')
            }

        });

};