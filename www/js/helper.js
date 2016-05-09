// helper file
// all method are declare here

var base_url = 'http://casaestilo.in/neonbuzz_admin/index.php/neonbuzz_api';
var image_url = 'http://casaestilo.in/neonbuzz_admin/upload_image/profile_pic';

var app_history = [];
var token = Lockr.get('user_token');
var user_id = 0;

var img_upload = '';

function showPage(page, ctrlr, scope) {
	console.log('page: '+page);
	app_history.push(page);
	$('.main-section').hide();
    $('.menu').fadeOut('slow');
    $(page).fadeIn();
    ctrlr(scope);
}

function backPage(page) {
    console.log('page: '+page);
    // app_history.push(page);
    $('.main-section').hide();
    $('.menu').fadeOut('slow');
    $(page).fadeIn();
    // ctrlr(scope);
}

function j2s(data) {
    return JSON.stringify(data);
}

function get_location(city_id) {
    // get location
    var loacation_options = '';
    $.ajax({
        url: base_url + '/get_location',
        type: 'post',
        dataType: 'json',
        async: false,
        data: {
            token: token,
            city_id: city_id,
        },
        success: function(data){
            // console.log(data);
            $.each(data, function(index, val) {
                loacation_options += '<option value="'+val.id+'">'+val.name+'</option>';
            });
        }
    });
    return loacation_options;
}

function get_image_from_device_profile(where) {
    console.log('ok');
    var img = navigator.camera.getPicture(
        profile_image_success, 
        profile_image_fail, 
        {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: where,
            // sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
        }
    );
}

function profile_image_success(imgUri) {
    var fileURL = imgUri;

    var uri = encodeURI(base_url + "/upload_user_img");
    var options = new FileUploadOptions();

    options.fileKey = "file";
    options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";

    var headers = {
        'headerParam': 'headerValue'
    };
    options.headers = headers;

    var ft = new FileTransfer();
    ft.upload(fileURL, uri, profile_upload_success, profile_upload_error, options);
}

function profile_image_fail(message) {
    console.log('Failed because: ' + message);
}

function profile_upload_success(r) {
    $('.profile_img_name').val('');
    $('.profile_img_name').val(r.response);
    var res_img = r.response;
    var final_img = res_img.replace(/\"/g, "");
    img_upload = final_img;
    // alert('img_upload: '+img_upload);
    $('.profile_img_name').val(img_upload);
}

function profile_upload_error(error) {
    console.log("An error has occurred: Code = " + error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}

function update_profile() {
    var name = $('.user_edit_name').val();
    var email = $('.user_edit_email').val();
    var city = $('.user_edit_city').val();
    var location = $('.user_edit_location').val();
    var gender = $('.user_edit_gender').val();
    var dob = $('.user_edit_dob').val();
    var profile_pic = $('.profile_img_name').val();

    if (name=='' || email=='' || city=='' || location=='' || gender=='' || dob=='' || profile_pic=='') {
        alert('please input feilds!!!');
        return;
    }

    $.ajax({
        url: base_url+'/update_profile',
        type: 'POST',
        dataType: 'JSON',
        data: {
            token: token,
            name: name,
            email: email,
            city: city,
            location: location,
            gender: gender,
            dob: dob,
            profile_pic: profile_pic,
        },
    })
    .done(function(data) {
        console.log("success: "+j2s(data));
        if (data.status == 'success') {
            alert('profile updated...');
        }
    })
    .fail(function(data) {
        var data_string = JSON.stringify(data);
        console.log("error: "+data_string);
    })
    .always(function() {
        console.log("complete");
    });
    
}

function blank(scope) {}


function beforeRegisterCtrlr(scope) {
    console.log('nothing here');
}

function createFeedCtrlr(scope) {
    console.log('nothing here');
}

function submit_form() {
    alert('server response: 203');
    return;
}

// login controller
function loginCtrlr(scope) {
    scope = JSON.stringify(scope);
	console.log('login by me: '+scope);
	$('#login_user').click(function(event) {
		console.log('hi');
		var email = $('.login_email').val();
		var password = $('.login_password').val();

		var email = 'admin@admin.com';
		var password = 'password';

		if (email == '' || password == '') {
            alert('Please fill the fields');
            return false;
        } else {
            console.log('mai chutiya huu');

            $.ajax({
                url: base_url+'/login',
                type: 'POST',
                dataType: 'JSON',
                crossDomain: true,
                data: {
                    email: email,
                    password: password,
                },
            })
            .done(function(data) {
                console.log("success: "+data);
                if (data.status == 'Success') {
                    Lockr.set('user_token', data.token);
                    token = Lockr.get('user_token');
                    Lockr.set('user_type', data.user_type);
                    user_id = data.id;
                    showPage('#thankyou', thankyouCtrlr, {user_id: user_id});
                }
            })
            .fail(function(data) {
                data = JSON.stringify(data);
                console.log("error"+data);
            })
            .always(function() {
                console.log("complete");
            });
            console.log('token: '+Lockr.get('user_token'));
        }
	});
}

function thankyouCtrlr(scope) {
	$('.update-btn').click(function(event) {
		var user_type = Lockr.get('user_type');
		if (user_type == 'Shopper') {
			showPage('#user-profile', userProfileCtrlr, scope);
		} else {
			showPage('#brand-profile', brandProfileCtrlr, scope);
		}
	});
}

function userProfileCtrlr(scope) {
    var city_id = 0;
    var location_id = 0;

    var scope_string = JSON.stringify(scope);
    console.log('scope: '+scope_string);

    // get city
    $.ajax({
        url: base_url + '/get_cities',
        type: 'post',
        dataType: 'json',
        async: false,
        data: {
            token: token
        },
        success: function(data){
            console.log(data);
            var city_options = '';
            $.each(data, function(index, val) {
                city_options += '<option value="'+val.id+'">'+val.name+'</option>';
            });
            $('.user_edit_city').append(city_options);
        }
    });

    // get user data
	$.ajax({
        url: base_url + "/get_user_profile",
        dataType: "json",
        type: "POST",
        async: false,
        data: {
            token: token,
            user_id: scope.user_id,
        },
        success: function(data) {
            console.log(data);
            if (data.status == 'Success') {
            	if (data.user_data[0].medium == 'register') {
            		$('#user_profile_img')
                    .attr('src', image_url+'/'+data.user_data[0].image+'.jpg');
            	} else {
            		$('#user_profile_img').attr('src', data.user_data[0].image);
            	}
            	
            	$('.follow-btn, .chat-btn').hide();

            	$('.follower_count').text(data.followers[0].datacount);
            	$('.following_count').text(data.following[0].datacount);

	    	    $("#user1").on("click", function() {
			        $('.user_form1').toggle();
			        // var user_token = Lockr.get('user_token');

			        $("#datepicker4").datepicker({
			            changeMonth: true,
			            changeYear: true
			        });
			    });

			    $('.user_edit_name').val(data.user_data[0].first_name);
			    $('.user_edit_email').val(data.user_data[0].email);
			    $('.user_edit_gender').val(data.user_data[0].gender);
			    $('.user_edit_dob').val(data.user_data[0].dob);
                $('.user_edit_city').val(data.user_data[0].city_id);
                $('.profile_img_name').val(data.user_data[0].image);

                city_id = data.user_data[0].city_id;
                location_id = data.user_data[0].location_id;
            }
        }
    });

    var loacation_options = get_location(city_id);
    $('.user_edit_location').append(loacation_options);
    $('.user_edit_location').val(location_id);

    $('.user_edit_city').change(function(event) {
        var loacation_options = get_location($('.user_edit_city').val());
        console.log('ok: '+loacation_options);
        $('.user_edit_location').html(loacation_options);
        $('.user_edit_location').val('');
    });
}

function feedListCtrlr(scope) {
    console.log('tokenkon: '+token);

    $.ajax({
        url: base_url+'/list_feed',
        type: 'POST',
        dataType: 'JSON',
        crossDomain: true,
        data: {
            token: token,
        },
    })
    .done(function(data) {
        console.log('ok');
        console.log("success: "+j2s(data));

        if (data.status=='success') {
            
            var html = '';
            $.each(data.feeds, function(index, val) {
                html +=    
                            '<div class="mobile-grid-100 padd0 user-banner">'+
                                '<img src="'+image_url+'/'+val.image+'.jpg" onclick="showPage(\'#single_feed\', feedSingleCtrlr, {feed_id: '+val.id+'})" class="user-banner-block">'+
                                '<img src="'+image_url+'/'+val.users_image+'.jpg" class="feed-profile">'+
                                '<span class="user-name">'+val.first_name+'</span>'+
                                '<img src="images/feed-heart.png" class="feed-heart">'+
                                '<img src="images/buzz-right.png" class="feed-right" id="fp1">'+
                                '<img src="images/delete-icon.png" class="feed-delete-icon" id="fd1">'+
                                '<img src="images/reverse-icon.png" class="feed-reverse-icon" id="ff1">'+
                            '</div>';
            });

            $('.feed_wrapper').append(html);
        }
    })
    .fail(function(data) {
        console.log("error: "+j2s(data));
    })
    .always(function() {
        console.log("complete");
    });
}

function feedSingleCtrlr (scope) {
    var feed_id = scope.feed_id;
    console.log('single feed: '+feed_id);

    $.ajax({
        url: base_url+'/single_feed',
        type: 'POST',
        dataType: 'JSON',
        crossDomain: true,
        data: {
            token: token,
            feed_id: feed_id,
        },
    })
    .done(function(data) {
        console.log("success: "+j2s(data));

        if (data.status=='success') {
            $('.share-banner-block').attr('src', image_url+'/'+data.feed.image+'.jpg');
            $('.sharep').html(data.feed.tag);
            $('.sharespan').html(data.feed.description);
        }
    })
    .fail(function() {
        console.log("error");
    })
    .always(function() {
        console.log("complete");
    });
    
}

function buzzListCtrlr(scope) {
    console.log('tokenkon: '+token);

    $.ajax({
        url: base_url+'/list_buzz',
        type: 'POST',
        dataType: 'JSON',
        crossDomain: true,
        data: {
            token: token,
        },
    })
    .done(function(data) {
        console.log('ok');
        console.log("success: "+j2s(data));

        if (data.status=='success') {
            
            var html = '';
            $.each(data.buzzs, function(index, val) {

                html +=    
                            '<div class="mobile-grid-100 padd0 offer-banner buzz-banner">'+
                                '<img src="'+image_url+'/'+val.image+'.jpg" onclick="showPage(\'#single_buzz\', buzzSingleCtrlr, {buzz_id: '+val.id+'})" class="offer-banner-block buzz-banner-block">'+
                                '<div class="mobile-grid-33 offer-left">'+
                                    '<img src="'+image_url+'/'+val.users_image+'.jpg" class="offer-left-img">'+
                                    '<p>'+val.name+'</p><br>'+
                                    '<span>'+val.description+'</span>'+
                                '</div>'+
                                '<div class="mobile-grid-33">'+
                                    '<img src="images/buzz-right.png" class="offer-right" id="p1">'+
                                    '<img src="images/delete-icon.png" class="delete-icon" id="d1">'+
                                    '<img src="images/reverse-icon.png" class="reverse-icon" id="f1">'+
                                    '<img src="images/feed-heart.png" class="offer-heart">'+
                                '</div>'+
                            '</div>';
            });

            $('.buzz_wrapper').append(html);
        }
    })
    .fail(function(data) {
        console.log("error: "+j2s(data));
    })
    .always(function() {
        console.log("complete");
    });
}

function buzzSingleCtrlr (scope) {
    var buzz_id = scope.buzz_id;
    console.log('single buzz: '+buzz_id);

    $.ajax({
        url: base_url+'/single_buzz',
        type: 'POST',
        dataType: 'JSON',
        crossDomain: true,
        data: {
            token: token,
            buzz_id: buzz_id,
        },
    })
    .done(function(data) {
        console.log("success: "+j2s(data));

        if (data.status=='success') {
            $('#single-buzz-image').css('background', 'url('+image_url+'/'+data.buzz.image+'.jpg) no-repeat');
            $('.sharep').html(data.buzz.tag);
            $('.sharespan').html(data.buzz.description);
        }
    })
    .fail(function() {
        console.log("error");
    })
    .always(function() {
        console.log("complete");
    });
    
}

function offerListCtrlr (scope) {
    console.log('offer');
}

function brandProfileCtrlr(scope) {
	$.ajax({
        url: base_url + "/get_brand_profile",
        dataType: "json",
        type: "POST",
        data: {
            token: token
        },
        success: function(data) {
            console.log(data);
            if (data.status == 'Success') {
            	if (data.user_data[0].medium == 'register') {
            		$('#user_profile_img').attr('src', image_url+'/'+data.user_data[0].image+'.jpg');
            	} else {
            		$('#user_profile_img').attr('src', data.user_data[0].image);
            	}
            	
            	$('.follow-btn, .chat-btn').hide();

            	$('.follower_count').text(data.followers[0].datacount);
            	$('.following_count').text(data.following[0].datacount);

	    	    $("#user1").on("touchstart", function() {
			        $('.user_form1').toggle();
			        // var user_token = Lockr.get('user_token');

			        $("#datepicker4").datepicker({
			            changeMonth: true,
			            changeYear: true
			        });
			    });

			    $('.user_edit_name').val(data.user_data[0].first_name);
			    $('.user_edit_email').val(data.user_data[0].email);
			    $('.user_edit_gender').val(data.user_data[0].gender);
			    $('.user_edit_dob').val(data.user_data[0].dob);
            }
        }
    });
}










