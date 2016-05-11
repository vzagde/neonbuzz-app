var base_url = 'http://casaestilo.in/neonbuzz_admin/index.php/api';
var image_url = 'http://casaestilo.in/neonbuzz_admin/upload_image/profile_pic';

var user_data = '';
var followes = '';
var followings = '';
var uploaded_image = '';
var chk_user_type = '';
var phoneno = /^\d{10}$/;
var em_val = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
var profileToId = '';
var sender_img = '';
var reciever_img = '';
openFB.init('1709189259297910', '', window.localStorage);
var token = '';

$.ajax({
    url: base_url + "/city",
    dataType: "json",
    type: "POST",
    async: false,
    success: function(response) {
        var html = '<option value="">Select City</option>';
        $.each(response, function(index, value){
            html += '<option value="'+value.id+'">'+value.name+'</option>';
        })
        $(".shopper_city, .shopper_city1").empty();
        $(".shopper_city, .shopper_city1").html(html);
    }
})

$(".shopper_city, .shopper_city1").change(function(){
    console.log($(this).val());
    $.ajax({
        url: base_url + "/location",
        dataType: "json",
        type: "POST",
        async: false,
        data : { city : $(this).val(),},
        success: function(response) {
            var html = '<option value="">Select Location</option>';
            $.each(response, function(index, value){
                html += '<option value="'+value.id+'">'+value.name+'</option>';
            })
            $(".shopper_location, .shopper_location1").empty();
            $(".shopper_location, .shopper_location1").html(html);
        }
    })
})

$(".continueapp-btn").click(function(){
    $(".main-section").hide();
    token = Lockr.get('user_token');

    if (token) {
        token = token;
        alert(token);
        $.ajax({
            url : base_url+'/get_user_data',
            type : 'POST',
            async : false,
            data : { user_id : token, },
            success : function(response){
                var obj = JSON.parse(response);
                var image = '';
                user_data = obj.data;
                followes =  obj.followers; 
                followings = obj.followings;
                if (user_data.medium == 'facebook') {
                    image = obj.data.image;
                } else {
                    image = image_url+"/"+obj.data.image+".jpg";
                }

                var type = 'visitor';

                if (obj.data.id == user_data.id) {
                    type = 'user';
                }
                display_profileData(image, obj.data.id, type, obj.followers.length, obj.followings.length);
                $(".main-section").hide();
                $("#user-profile").show();
            }
        })
    } else {
        console.log("Do Not have Token");
        token = 'NOIDEA';
        console.log(token);
    }

    if (token == 'NOIDEA') {
        $("#login").show();
    } else {
        displayFeed();
    }
})

$("#login_user").click(function(){
    if (!$(".login_email").val()) {
        alert("Please Enter User Name");
    } else if (!$(".login_email").val().match(em_val)) {
        alert("Please Enter Valid Email ID");
    } else if (!$(".login_password").val()) {
        alert("Please Enter Password");
    } else {
        $.ajax({
            url : base_url+'/user_login',
            type : 'POST',
            async : false,
            data : { username : $(".login_email").val(), password: $(".login_password").val(), },
            success : function(response){
                var obj = JSON.parse(response);
                followers = obj.followers;
                followings = obj.followings;
                user_data = obj.data;
                Lockr.set("user_token", user_data.id)
                if (obj.status == 'Success') {
                    $(".main-section").hide();
                    displayFeed();
                    get_notification_count();
                }
            }
        })
    }
})

$(".update-btn, #uprofile-page").click(function(){
    $(".main-section").hide();
    console.log(user_data);
    if (user_data.user_type == 'Shopper') {
        var image = '';
        if (user_data.medium == 'facebook') {
            image = user_data.image;
        } else {
            image = image_url+"/"+user_data.image+".jpg";
        }
        display_profileData(image, user_data.id, 'user', followers.length, followings.length);
        $("#user-profile").show();
    } else {
        var image = '';
        if (user_data.medium == 'facebook') {
            image = user_data.image;
        } else {
            image = image_url+"/"+user_data.image+".jpg";
        }
        display_brandprofileData(image, user_data, 'user', followers.length, followings.length);
        $("#brand-profile").show();
    }
    $('.menu').fadeOut('slow');
})

function display_profileData(image, id, type, followers, followings){
    $('#user_profile_img').attr("src", image);
    $(".follower_count").text(followers);
    $(".following_count").text(followings);

    if (type == 'user') {
        $('#user1').show();
        $('#follow_button').hide();
        $(".chat_user").hide();
    } else if (type == 'visitor') {
        $('#user1').hide();
        $('#follow_button').show();
        $(".chat_user").show();
        $(".chat_user").attr("id", id);
    }
}

function display_brandprofileData(image, user_data, type, followers, followings){
    console.log(image);
    $('#brand_profile_img').attr("src", image);
    $(".follower_count").text(followers);
    $(".following_count").text(followings);
    // $("#location_brand").text(user_data.email);
    $("#email_brand").text(user_data.email);
    // $("#contact_brand").text(user_data.email);

    if (type == 'user') {
        $('#brand1').show();
        $('.follow_user').hide();
        $(".chat_user").hide();
    } else if (type == 'visitor') {
        $('#brand1').hide();
        $('.follow_user').show();
        $(".chat_user").show();
        $(".chat_user").attr("id", user_data.id);
    }
}


$(".flag").click(function(){
    if (user_data.user_type == 'Shopper') {
        displayOffers();
    } else {
        displayBuzz();
    }
})

$(".camera").click(function(){
    $(".main-section").hide();
    $("#create-feed").show();
})

$(".close-buzz").click(function(){
    $(".popup-buzz").hide();
})

function facebook_login(){
    openFB.login('email',
        function() {
            get_info();
        },
        function() {
            alert('Facebook login failed');
        }
    );
}

function get_info(){
    openFB.api({
        path: '/me',
        success: function(data) {
            login_via_fb(data);
        },
        error: function(response) {
            alert('Not able to access data');
        }
    });
}

function login_via_fb(data){
    console.log(data);
    console.log(data.name);
    console.log(data.id);
    $.ajax({
        url : base_url+'/facebook_login',
        type : 'POST',
        async : false,
        data : { user_id : data.id, name: data.name, },
        success : function(response){
            var obj = JSON.parse(response);
            followers = obj.followers;
            followings = obj.followings;
            user_data = obj.data;
            if (obj.status == 'Success') {
                $(".main-section").hide();
                $("#thankyou").show();
                get_notification_count();
            }
        }
    })

}

function displayOffers(){
    $(".main-section").hide();
    $.ajax({
        url : base_url+'/get_offers',
        type : 'POST',
        async : false,
        data : { token : user_data.token, },
        success : function(response){
            var obj = JSON.parse(response);
            console.log(obj);
            var html = '';
            if (obj.status == 'Success') {
                $.each(obj.offers, function(index, value){
                    html += '<div class="mobile-grid-100 padd0 offer-banner1" id="'+value.id+'">'+
                            '<img src="'+image_url+'/'+value.image.toString().replace(/"/g, "")+'.jpg" class="offer-banner-block" onclick="get_single_offers('+value.id+')">'+
                            '<div class="offer-left">';
                    if (value.medium == 'register') {
                        html += '<img src="'+image_url+'/'+value.profile+'.jpg" class="offer-left-img open-user-profile" data-user="'+value.userid+'">';
                    } else {
                        html += '<img src="'+value.profile+'" class="offer-left-img">';
                    }
                    html += '<p>'+value.tag+'</p><br>'+
                            '<span>'+value.description+'</span>'+
                            '</div>'+
                            '<div class="offer-rht">'+
                            '<img id="like_image_'+value.id+'" src="images/feed-heart.png" data-feed="'+value.id+'" data-user="'+value.userid+'" class="offer-heart">'+
                            '<img src="images/buzz-right.png" data-feed="'+value.id+'" data-user="'+value.userid+'" class="offer-right" data-id="show_'+value.id+'" id="op2">'+
                            '<img src="images/delete-icon.png" data-feed="'+value.id+'" data-user="'+value.userid+'" class="offer-delete-icon tm show_'+value.id+'" id="od2">'+
                            '<img src="images/reverse-icon.png" data-feed="'+value.id+'" data-user="'+value.userid+'" class="offer-reverse-icon tm1 show_'+value.id+'" id="of2">'+
                            '</div>'+
                            '</div>';                            
                })
            } else {
                html = "Couldn't find offers for you";
            }

            $("#offers_listing_disp").empty();
            $("#offers_listing_disp").html(html);

            var toggle_id = 0;
            $('.offer-right').click(function(){
                var cls = "."+$(this).data("id");
                if (toggle_id == 0) {
                    $(".offer-delete-icon").hide();
                    $(".offer-reverse-icon").hide();
                    $(cls).show();
                    $(cls).show();
                    toggle_id = 1;
                } else {
                    $(".offer-delete-icon").hide();
                    $(".offer-reverse-icon").hide();
                    $(cls).hide();
                    $(cls).hide();
                    toggle_id = 0;
                }
            });

            $(".offer-heart").click(function(){
                var feedid = $(this).data("feed");
                $.ajax({
                    url : base_url+'/add_to_like',
                    type : 'POST',
                    async : false,
                    data : { id : feedid, user : user_data.id, type : 'buzz'},
                    success : function(response){
                        console.log(response);
                        if (response == 'liked') {
                            var imgid = '#like_image_'+feedid;
                            $(imgid).attr('src', 'images/heart_fill.png');
                        } else {
                            $(feedid).attr("src", "images/feed-heart.png");
                        }
                    }
                })
            })

            $(".offer-delete-icon").click(function(){
                remove_from_list($(this).data("feed"), user_data.id, 'buzz');
            })

            $(".open-user-profile").click(function(){
                $.ajax({
                    url : base_url+'/get_user_data',
                    type : 'POST',
                    async : false,
                    data : { user_id : $(this).data("user"), },
                    success : function(response){
                        var obj = JSON.parse(response);
                        var image = '';
                        user_data = obj.data;
                        if (user_data.medium == 'facebook') {
                            image = obj.data.image;
                        } else {
                            image = image_url+"/"+obj.data.image+".jpg";
                        }

                        var type = 'visitor';

                        if (obj.data.id == user_data.id) {
                            type = 'user';
                        }
                        display_profileData(image, obj.data.id, type, obj.followers.length, obj.followings.length);
                        $(".main-section").hide();
                        $("#user-profile").show();
                    }
                })
            })
        }
    })
    $("#offer").show();
}

function displayBuzz(){
    $(".main-section").hide();
    $.ajax({
        url : base_url+'/get_buzz',
        type : 'POST',
        async : false,
        data : { token : user_data.token, },
        success : function(response){
            var obj = JSON.parse(response);
            var html = '';
            if (obj.status == 'Success') {
                $.each(obj.offers, function(index, value){
                    html += '<div class="mobile-grid-100 padd0 offer-banner1" id="'+value.id+'">'+
                            '<img src="'+image_url+'/'+value.image.toString().replace(/"/g, "")+'.jpg" class="offer-banner-block" onclick="get_single_buzz('+value.id+')">'+
                            '<div class="offer-left">';
                    if (value.medium == 'register') {
                        html += '<img src="'+image_url+'/'+value.profile+'.jpg" class="offer-left-img open-user-profile" data-user="'+value.userid+'">';
                    } else {
                        html += '<img src="'+value.profile+'" class="offer-left-img">';
                    }
                    html += '<p>'+value.tag+'</p><br>'+
                            '<span>'+value.description+'</span>'+
                            '</div>'+
                            '<div class="offer-rht">'+
                            '<img id="like_image_'+value.id+'" src="images/feed-heart.png" data-feed="'+value.id+'" data-user="'+value.userid+'" class="offer-heart">'+
                            '<img src="images/buzz-right.png" data-feed="'+value.id+'" data-user="'+value.userid+'" class="offer-right" data-id="show_'+value.id+'" id="op2">'+
                            '<img src="images/delete-icon.png" data-feed="'+value.id+'" data-user="'+value.userid+'" class="offer-delete-icon tm show_'+value.id+'" id="od2">'+
                            '<img src="images/reverse-icon.png" data-feed="'+value.id+'" data-user="'+value.userid+'" class="offer-reverse-icon tm1 show_'+value.id+'" id="of2">'+
                            '</div>'+
                            '</div>';
                })
            } else {
                html = "Couldn't find offers for you";
            }

            $(".buzz_wrapper").empty();
            $(".buzz_wrapper").html(html);

            var toggle_id = 0;
            $('.offer-right').click(function(){
                var cls = "."+$(this).data("id");
                if (toggle_id == 0) {
                    $(".offer-delete-icon").hide();
                    $(".offer-reverse-icon").hide();
                    $(cls).show();
                    $(cls).show();
                    toggle_id = 1;
                } else {
                    $(".offer-delete-icon").hide();
                    $(".offer-reverse-icon").hide();
                    $(cls).hide();
                    $(cls).hide();
                    toggle_id = 0;
                }
            });

            $(".offer-heart").click(function(){
                var feedid = $(this).data("feed");
                $.ajax({
                    url : base_url+'/add_to_like',
                    type : 'POST',
                    async : false,
                    data : { id : feedid, user : user_data.id, type : 'buzz'},
                    success : function(response){
                        console.log(response);
                        if (response == 'liked') {
                            var imgid = '#like_image_'+feedid;
                            $(imgid).attr('src', 'images/heart_fill.png');
                        } else {
                            $(feedid).attr("src", "images/feed-heart.png");
                        }
                    }
                })
            })

            $(".offer-delete-icon").click(function(){
                remove_from_list($(this).data("feed"), user_data.id, 'buzz');
            })

            $(".open-user-profile").click(function(){
                $.ajax({
                    url : base_url+'/get_user_data',
                    type : 'POST',
                    async : false,
                    data : { user_id : $(this).data("user"), },
                    success : function(response){
                        var obj = JSON.parse(response);
                        var image = '';
                        if (user_data.medium == 'facebook') {
                            image = obj.data.image;
                        } else {
                            image = image_url+"/"+obj.data.image+".jpg";
                        }

                        var type = 'visitor';

                        if (obj.data.id == user_data.id) {
                            type = 'user';
                        }
                        display_profileData(image, obj.data.id, type, obj.followers.length, obj.followings.length);
                        $(".main-section").hide();
                        $("#user-profile").show();
                    }
                })
            })
        }
    })
    $("#buzz").show();
}

$("#buzz_submit").click(function(){
    if (!$(".buzz_tags").val()) {
        alert("Please Enter Tags");
    } else if (!$(".buzz_desc").val()) {
        alert("Please Enter Description");
    } else if (!$(".buzz_category").val()) {
        alert("Please Select Category");
    // } else if (!$(".buzz_start_date").val()) {
    //     alert("Please Select Start Date");
    // } else if (!$(".buzz_start_time").val()) {
    //     alert("Please Select Start Time");
    // } else if (!$(".buzz_end_date").val()) {
    //     alert("Please Select End Date");
    // } else if (!$(".buzz_end_time").val()) {
    //     alert("Please Select End Time");
    } else if (uploaded_image == '') {
        alert("Please Upload Image");
    } else {
        var type = '';
        if (user_data.user_type == 'Shopper') {
            type = 'buzz';
        } else {
            type = 'offer';
        }
        $.ajax({
            url : base_url+'/create_buzz',
            type : 'POST',
            async : false,
            data : { user_id : user_data.id, tag : $('.buzz_tags').val(), description : $('.buzz_desc').val(), location : '0', image : uploaded_image, time_from : $(".buzz_start_date").val()+$(".buzz_start_time").val(), time_to : $(".buzz_end_date").val()+$(".buzz_end_time").val(), type : type },
            success : function(response){
                if (response == "Success") {
                    uploaded_image = '';
                    displayFeed();
                } else {
                    alert("Error While record creation");
                }
            }
        })
    }
})

$("#create_feed").click(function(){
    $(".main-section").hide();
    $("#create-feed").show();
})

$(".chat-msg").click(function(){
    $(".main-section").hide();
    $("#chat").show();
})

$(".chat_people").click(function() {
    var user_token = user_data.token;

    $.ajax({
        url: base_url + "/get_all_users_for_chat",
        dataType: "json",
        type: "POST",
        data: {
            'token': user_token,
            'type': 'Shopper'
        },
        success: function(data) {
            console.log(data);
            $('.chat_list_wrapper').html('');
            console.log(data);
            $.each(data, function(i, v) {
                var html = '';
                html += '<div id="'+v.id+'" class="mobile-grid-100 padd0 msg chat-window">';
                html += '<div class="mobile-grid-25 pic padd0">';
                if (v.medium == 'facebook') {
                    html += '<img id="' + v.uid + '" src="' + v.image + '" class="user_profile_pic">';
                } else {
                    html += '<img id="' + v.uid + '" src="' + image_url + '/' + v.image + '.jpg" class="user_profile_pic">';
                }
                html += '</div>';
                html += '<div class="mobile-grid-75 padd0 msg-block">';
                html += '<h4>'+v.first_name+'</h4>';
                html += '<span class="time"></span>';
                html += '<p></p>';
                html += '</div>';
                html += '</div>';

                $('.chat_list_wrapper').append(html);
            });

            $(".chat-window").click(function(){
                user_token = user_data.token;
                profileToId = $(this).attr("id");
                console.log(profileToId);
                load_chat_msg(user_token, profileToId);
                $('.main-section').hide();
                $('#chat2').fadeIn();
            })
        }
    });
});

$(".chat_brand").click(function() {
    var user_token = user_data.token;

    $.ajax({
        url: base_url + "/get_all_users_for_chat",
        dataType: "json",
        type: "POST",
        data: {
            'token': user_token,
            'type': 'Bussiness'
        },
        success: function(data) {
            console.log(data);
            $('.chat_list_wrapper').html('');
            $.each(data, function(i, v) {
                var html = '';
                html += '<div id="'+v.id+'" class="mobile-grid-100 padd0 msg chat-window">';
                html += '<div class="mobile-grid-25 pic padd0">';
                if (v.medium == 'facebook') {
                    html += '<img id="' + v.uid + '" src="' + v.image + '" class="user_profile_pic">';
                } else {
                    html += '<img id="' + v.uid + '" src="' + image_url + '/' + v.image + '.jpg" class="user_profile_pic">';
                }
                html += '</div>';
                html += '<div class="mobile-grid-75 padd0 msg-block">';
                html += '<h4>'+v.first_name+'</h4>';
                html += '<span class="time"></span>';
                html += '<p></p>';
                html += '</div>';
                html += '</div>';

                $('.chat_list_wrapper').append(html);
            });
            $(".chat-window").click(function(){
                user_token = user_data.token;
                profileToId = $(this).attr("id");
                console.log(profileToId);
                load_chat_msg(user_token, profileToId);
                $('.main-section').hide();
                $('#chat2').fadeIn();
            })
        }
    });
});

var fxp2 = 0;
$(".feed-right").click(function(){
    if (fxp2 == 0) {
        $('#ff2').fadeIn();
        $('#fd2').fadeIn();
        fxp2 = 1;
    } else if (fxp2 == 1) {
        $('#ff2').fadeOut();
        $('#fd2').fadeOut();
        fxp2 = 0;
    }
})

$(".globe").click(function(){
    $(".main-section").hide();
    get_notification();
    $("#notification-screen").show();
})

$('#feed_submit').click(function() {
    if (!$('.feed_tags').val()) {
        alert("Please Enter Tags");
    } else if (!$('.feed_desc').val()) {
        alert("Please Enter Description");
    } else if (!$('.feed_location').val()) {
        alert("Please Enter Location");
    } else if (uploaded_image == '') {
        alert("Please Upload Image");
    } else {
        $.ajax({
            url : base_url+'/create_feed',
            type : 'POST',
            async : false,
            data : { user_id : user_data.id, tag : $('.feed_tags').val(), description : $('.feed_desc').val(), location : $('.feed_location').val(), image : uploaded_image, },
            success : function(response){
                if (response == "Success") {
                    uploaded_image = '';
                    displayFeed();
                } else {
                    alert("Error While record creation");
                }
            }
        })
    }
})

function displayFeed(){
    console.log(user_data);
    $(".main-section").hide();
    $.ajax({
        url : base_url+'/get_feeds',
        type : 'POST',
        async : false,
        data : { token : user_data.token },
        success : function(response){
            console.log(response);
            var obj = JSON.parse(response);
            console.log(obj);
            var html = '';
            if (obj.status == 'Success') {
                $.each(obj.feeds, function(index, value){
                    html += '<div class="mobile-grid-100 padd0 user-banner" id="'+value.id+'">'+
                            '<img src="'+image_url+'/'+value.image.toString().replace(/"/g, "")+'.jpg" onclick="get_single_feed('+value.id+')" class="user-banner-block" data-feed="'+value.id+'">';
                    if (value.medium == 'register') {
                        html += '<img src="'+image_url+'/'+value.profile+'.jpg" class="feed-profile" data-user="'+value.userid+'">';
                    } else {
                        html += '<img src="'+value.profile+'" class="feed-profile" data-user="'+value.userid+'">';
                    }
                    html += '<span class="user-name">'+value.first_name+'</span>'+
                            '<img id="like_image_'+value.id+'" src="images/feed-heart.png" data-feed="'+value.id+'" data-user="'+value.userid+'" class="feed-heart">'+
                            '<img src="images/buzz-right.png" data-feed="'+value.id+'" data-user="'+value.userid+'" class="feed-right" data-id="show_'+value.id+'" id="fp1">'+
                            '<img src="images/delete-icon.png" data-feed="'+value.id+'" data-user="'+value.userid+'" class="feed-delete-icon show_'+value.id+'" id="fd1">'+
                            '<img src="images/reverse-icon.png" data-feed="'+value.id+'" data-user="'+value.userid+'" class="feed-reverse-icon show_'+value.id+'" id="ff1">'+
                            '</div>';
                })
            } else {
                html = "Couldn't find feeds for you";
            }
            $(".feed_wrapper").empty();
            $(".feed_wrapper").html(html);
            var toggle_id = 0;
            $('.feed-right').click(function(){
                var cls = "."+$(this).data("id");
                if (toggle_id == 0) {
                    $(".feed-delete-icon").hide();
                    $(".feed-reverse-icon").hide();
                    $(cls).show();
                    $(cls).show();
                    toggle_id = 1;
                } else {
                    $(".feed-delete-icon").hide();
                    $(".feed-reverse-icon").hide();
                    $(cls).hide();
                    $(cls).hide();
                    toggle_id = 0;
                }
            });

            $(".feed-heart").click(function(){
                var feedid = $(this).data("feed");
                $.ajax({
                    url : base_url+'/add_to_like',
                    type : 'POST',
                    async : false,
                    data : { id : feedid, user : user_data.id, type : 'feed'},
                    success : function(response){
                        console.log(response);
                        if (response == 'liked') {
                            var imgid = '#like_image_'+feedid;
                            $(imgid).attr('src', 'images/heart_fill.png');
                        } else {
                            $(feedid).attr("src", "images/feed-heart.png");
                        }
                    }
                })
            })

            $(".feed-delete-icon").click(function(){
                remove_from_list($(this).data("feed"), user_data.id, 'feed');
            })

            $(".feed-profile").click(function(){
                $.ajax({
                    url : base_url+'/get_user_data',
                    type : 'POST',
                    async : false,
                    data : { user_id : $(this).data("user"), },
                    success : function(response){
                        var obj = JSON.parse(response);
                        var image = '';
                        if (user_data.medium == 'facebook') {
                            image = obj.data.image;
                        } else {
                            image = image_url+"/"+obj.data.image+".jpg";
                        }

                        var type = 'visitor';

                        if (obj.data.id == user_data.id) {
                            type = 'user';
                        }
                        display_profileData(image, obj.data.id, type, obj.followers.length, obj.followings.length);
                        $(".main-section").hide();
                        $("#user-profile").show();
                    }
                })
            })
        }
    })
    $("#feed").show();
}

function remove_from_list(id, user, type) {
    $.ajax({
        url : base_url+'/remove_data',
        type : 'POST',
        async : false,
        data : { id : id, user : user, type : type},
        success : function(response){
            console.log(response);
            id = '#'+id;
            $(id).hide();
            alert("This "+type+" won't be displayed in your list again");
        }
    })
}

// function add_to_like(id, user, type) {

// }

$("#r1").click(function(){
    chk_user_type = 'Shopper';
})

$("#r2").click(function(){
    chk_user_type = 'Buisness';
})

$("#register_user").click(function(){
    if (!$(".shopper_name").val()) {
        alert("Please Enter Name");
    } else if (!$(".shopper_email").val()) {
        alert("Please Enter Email");
    } else if (!$(".shopper_email").val().match(em_val)) {
        alert("Please Enter Valid Email");
    } else if (!$(".password").val()) {
        alert("Please Enter Password");
    } else if (!$(".confirm_password").val()) {
        alert("Please Enter Confirm Password");
    } else if ($(".confirm_password").val() != $(".password").val()) {
        alert("Please Password doesn't match");
    } else if (!$(".shopper_city").val()) {
        alert("Please Selct City");
    } else if (!$(".shopper_location").val()) {
        alert("Please Selct Location");
    } else if (!$(".shopper_gender").val()) {
        alert("Please Select Gender");
    } else if (!$(".shopper_dob").val()) {
        alert("Please Enter DOB");
    } else {

        if (uploaded_image == '') {
            uploaded_image = 'default_user';
        }

        $.ajax({
            url : base_url+'/register_user', 
            type : 'POST', 
            async : false, 
            data : { first_name : $(".shopper_name").val(), email : $(".shopper_email").val(), password : $(".password").val(), city : $(".shopper_city").val(), location : $(".shopper_location").val(), gender : $(".shopper_gender").val(), dob : $(".shopper_dob").val(), image : uploaded_image,  }, 
            success : function(response) { 
                console.log(response);
                var obj = JSON.parse(response);
                if (obj.status == 'Success') {
                    followers = obj.followers;
                    followings = obj.followings;
                    user_data = obj.data;
                    if (obj.status == 'Success') {
                        uploaded_image = '';
                        $(".main-section").hide();
                        $("#thankyou").show();
                        get_notification_count();
                    }
                } else {
                    alert(obj.response);
                }
            }
        })
    }
})

$("#register_business").click(function(){
    if (!$(".shopper_name1").val()) {
        alert("Please Enter Name");
    } else if (!$(".business_name1").val()) {
        alert("Please Enter Bussiness Name");
    } else if (!$(".shopper_email1").val()) {
        alert("Please Enter Email");
    } else if (!$(".shopper_email1").val().match(em_val)) {
        alert("Please Enter Valid Email");
    } else if (!$(".password1").val()) {
        alert("Please Enter Password");
    } else if (!$(".confirm_password1").val()) {
        alert("Please Enter Confirm Password");
    } else if ($(".confirm_password1").val() != $(".password1").val()) {
        alert("Please Password doesn't match");
    } else if (!$(".shopper_city1").val()) {
        alert("Please Selct City");
    } else if (!$(".shopper_location1").val()) {
        alert("Please Selct Location");
    } else if (!$(".shopper_gender1").val()) {
        alert("Please Select Gender");
    } else if (!$(".shopper_category1").val()) {
        alert("Please Select Category");
    } else {

        if (uploaded_image == '') {
            uploaded_image = 'default_user';
        }
        $.ajax({
            url : base_url+'/register_user_bussiness', 
            type : 'POST', 
            async : false, 
            data : { first_name : $(".shopper_name1").val(), bussiness_name : $(".business_name1").val(), email : $(".shopper_email1").val(), password : $(".password1").val(), city : $(".shopper_city1").val(), location : $(".shopper_location1").val(), gender : $(".shopper_gender1").val(), dob : $(".shopper_dob1").val(), image : uploaded_image, bussiness_category : $(".shopper_category1").val().toString(), }, 
            success : function(response) { 
                uploaded_image = '';
                console.log(response);
                var obj = JSON.parse(response);
                if (obj.status == 'Success') {
                    followers = obj.followers;
                    followings = obj.followings;
                    user_data = obj.data;
                    if (obj.status == 'Success') {
                        $(".main-section").hide();
                        $("#thankyou").show();
                    }
                } else {
                    alert(obj.response);
                }
            }
        })
    }
})

function get_single_feed(id){
    $.ajax({
        url : base_url+'/get_single_feed', 
        type : 'POST', 
        async : false, 
        data : { id : id, user_id : user_data.id }, 
        success : function(response) { 
            var obj = JSON.parse(response);
            console.log(obj);
            var feed_data = obj.feed;
            $("#feed_header_image").css("background", "url("+image_url+"/"+feed_data.image.toString().replace(/"/g, "")+".jpg) no-repeat");
            $(".feed-header").css("background-size", "cover");
            if (user_data.medium == "register") {
                html += '<img src="'+image_url+'/'+user_data.image.toString().replace(/"/g, "")+'.jpg">';
            } else {
                html += '<img src="'+user_data.image+'">';
            }
            $("#feed_profile_image").attr("src", image_url+"/"+user_data.image.toString().replace(/"/g, "")+".jpg");
            var html = '';
            $.each(obj.comments, function(index, value){
                html += '<div class="mobile-grid-100 padd0 comment-msg">'+
                        '<div class="mobile-grid-20 padd0">';
                if (value.medium == "register") {
                    html += '<img src="'+image_url+'/'+value.image.toString().replace(/"/g, "")+'.jpg">';
                } else {
                    html += '<img src="'+value.image+'">';
                }
                html += '</div>'+
                    '<div class="mobile-grid-80 padd0">'+
                    '<p><strong>'+value.first_name+'</strong>'+value.comment+'</p>'+
                    '</div>'+
                    '</div>';
            })
            console.log(html);
            $(".feed_comment_wrapper").empty();
            $(".feed_comment_wrapper").html(html);
            $('.feed_comment_wrapper').attr('id', id);

            $('.submit_feed_comment').click(function() {
                var comment = $(this).siblings('.feed_comment').val();
                var feed_id = $('.feed_comment_wrapper').attr('id');

                if (comment == '') {
                    alert('Please write something in comment');
                    return false;
                }

                $.ajax({
                    url: base_url + "/submit_comment",
                    dataType: "json",
                    type: "POST",
                    data: {
                        'category_id': id,
                        'comment': comment,
                        'token': user_data.token,
                        'category': 'feed'
                    },
                    success: function(data) {
                        console.log(data);

                        if (data.status == 'success') {
                            $('.feed_comment').val('');

                            var html = '';
                            html += '=<div class="mobile-grid-100 padd0 comment-msg">';
                            html += '<div class="mobile-grid-20 padd0">';
                            if (data.data.medium == 'facebook') {
                                html += '<img id="' + data.data.uid + '" src="' + data.data.profile_pic + '" class="user_profile_pic">';
                            } else {
                                html += '<img id="' + data.data.uid + '" src="' + image_url + '/' + data.data.profile_pic + '.jpg" class="user_profile_pic">';
                            }
                            html += '</div>';
                            html += '<div class="mobile-grid-80 padd0">';
                            html += '<p><strong>' + data.data.first_name + ':</strong> ' + data.data.comment + '</p>';
                            html += '</div>';
                            html += '</div>';

                            $('.feed_comment_wrapper').prepend(html);
                        }

                    }
                });

            });
        }
    })
    $(".main-section").hide();
    $("#single_feed").show();
}

function get_single_offers(id){
    $.ajax({
        url : base_url+'/get_single_buzz', 
        type : 'POST', 
        async : false, 
        data : { id : id, user_id : user_data.id }, 
        success : function(response) { 
            var obj = JSON.parse(response);
            console.log(obj);
            var feed_data = obj.feed;
            $("#buzz_header_image").css("background", "url("+image_url+"/"+feed_data.image.toString().replace(/"/g, "")+".jpg) no-repeat");
            $(".feed-header").css("background-size", "cover");
            if (user_data.medium == "register") {
                html += '<img src="'+image_url+'/'+user_data.image.toString().replace(/"/g, "")+'.jpg">';
            } else {
                html += '<img src="'+user_data.image+'">';
            }
            $("#feed_profile_image").attr("src", image_url+"/"+user_data.image.toString().replace(/"/g, "")+".jpg");
            var html = '';
            $.each(obj.comments, function(index, value){
                html += '<div class="mobile-grid-100 padd0 comment-msg">'+
                        '<div class="mobile-grid-20 padd0">';
                if (value.medium == "register") {
                    html += '<img src="'+image_url+'/'+value.image.toString().replace(/"/g, "")+'.jpg">';
                } else {
                    html += '<img src="'+value.image+'">';
                }
                html += '</div>'+
                    '<div class="mobile-grid-80 padd0">'+
                    '<p><strong>'+value.first_name+'</strong>'+value.comment+'</p>'+
                    '</div>'+
                    '</div>';
            })
            console.log(html);
            $(".feed_comment_wrapper").empty();
            $(".feed_comment_wrapper").html(html);
            $('.feed_comment_wrapper').attr('id', id);

            $("#back-arrow-buzz").click(function(){
                displayOffers();
            })

            $('.submit_feed_comment').click(function() {
                var comment = $(this).siblings('.feed_comment').val();
                var feed_id = $('.feed_comment_wrapper').attr('id');

                if (comment == '') {
                    alert('Please write something in comment');
                    return false;
                }

                $.ajax({
                    url: base_url + "/submit_comment",
                    dataType: "json",
                    type: "POST",
                    data: {
                        'category_id': id,
                        'comment': comment,
                        'token': user_data.token,
                        'category': 'buzz'
                    },
                    success: function(data) {
                        console.log(data);

                        if (data.status == 'success') {
                            $('.feed_comment').val('');

                            var html = '';
                            html += '=<div class="mobile-grid-100 padd0 comment-msg">';
                            html += '<div class="mobile-grid-20 padd0">';
                            if (data.data.medium == 'facebook') {
                                html += '<img id="' + data.data.uid + '" src="' + data.data.profile_pic + '" class="user_profile_pic">';
                            } else {
                                html += '<img id="' + data.data.uid + '" src="' + image_url + '/' + data.data.profile_pic + '.jpg" class="user_profile_pic">';
                            }
                            html += '</div>';
                            html += '<div class="mobile-grid-80 padd0">';
                            html += '<p><strong>' + data.data.first_name + ':</strong> ' + data.data.comment + '</p>';
                            html += '</div>';
                            html += '</div>';

                            $('.feed_comment_wrapper').prepend(html);
                        }

                    }
                });

            });
        }
    })
    $(".main-section").hide();
    $("#single_feed").show();
}

function get_single_buzz(id){
    $.ajax({
        url : base_url+'/get_single_buzz', 
        type : 'POST', 
        async : false, 
        data : { id : id, user_id : user_data.id }, 
        success : function(response) { 
            var obj = JSON.parse(response);
            console.log(obj);
            var feed_data = obj.feed;
            $("#feed_header_image").css("background", "url("+image_url+"/"+feed_data.image.toString().replace(/"/g, "")+".jpg) no-repeat");
            $(".feed-header").css("background-size", "cover");
            if (user_data.medium == "register") {
                html += '<img src="'+image_url+'/'+user_data.image.toString().replace(/"/g, "")+'.jpg">';
            } else {
                html += '<img src="'+user_data.image+'">';
            }
            $("#feed_profile_image").attr("src", image_url+"/"+user_data.image.toString().replace(/"/g, "")+".jpg");
            var html = '';
            $.each(obj.comments, function(index, value){
                html += '<div class="mobile-grid-100 padd0 comment-msg">'+
                        '<div class="mobile-grid-20 padd0">';
                if (value.medium == "register") {
                    html += '<img src="'+image_url+'/'+value.image.toString().replace(/"/g, "")+'.jpg">';
                } else {
                    html += '<img src="'+value.image+'">';
                }
                html += '</div>'+
                    '<div class="mobile-grid-80 padd0">'+
                    '<p><strong>'+value.first_name+'</strong>'+value.comment+'</p>'+
                    '</div>'+
                    '</div>';
            })
            console.log(html);
            $(".feed_comment_wrapper").empty();
            $(".feed_comment_wrapper").html(html);
            $('.feed_comment_wrapper').attr('id', id);

            $("#back-arrow-buzz").click(function(){
                displayBuzz();
            })

            $('.submit_feed_comment').click(function() {
                var comment = $(this).siblings('.feed_comment').val();
                var feed_id = $('.feed_comment_wrapper').attr('id');

                if (comment == '') {
                    alert('Please write something in comment');
                    return false;
                }

                $.ajax({
                    url: base_url + "/submit_comment",
                    dataType: "json",
                    type: "POST",
                    data: {
                        'category_id': id,
                        'comment': comment,
                        'token': user_data.token,
                        'category': 'buzz'
                    },
                    success: function(data) {
                        console.log(data);

                        if (data.status == 'success') {
                            $('.feed_comment').val('');

                            var html = '';
                            html += '=<div class="mobile-grid-100 padd0 comment-msg">';
                            html += '<div class="mobile-grid-20 padd0">';
                            if (data.data.medium == 'facebook') {
                                html += '<img id="' + data.data.uid + '" src="' + data.data.profile_pic + '" class="user_profile_pic">';
                            } else {
                                html += '<img id="' + data.data.uid + '" src="' + image_url + '/' + data.data.profile_pic + '.jpg" class="user_profile_pic">';
                            }
                            html += '</div>';
                            html += '<div class="mobile-grid-80 padd0">';
                            html += '<p><strong>' + data.data.first_name + ':</strong> ' + data.data.comment + '</p>';
                            html += '</div>';
                            html += '</div>';

                            $('.feed_comment_wrapper').prepend(html);
                        }

                    }
                });

            });
        }
    })
    $(".main-section").hide();
    $("#single_feed").show();
}

$("#back-arrow-feed").click(function(){
    displayFeed();
})


// function get_single_buzz(id){
//     $.ajax({
//         url : base_url+'/get_single_feed', 
//         type : 'POST', 
//         async : false, 
//         data : { id : id }, 
//         success : function(response) { 
//             console.log(response);
//         }
//     })
//     $(".main-section").hide();
//     $("#single_feed").show();
// }

$("#user1").click(function(){
    $('.user_form1').toggle();
})

function update_profile() {
    var username = user_data.first_name;
    var email = user_data.email;
    var city = user_data.city_id;
    var location = user_data.location_id;
    var gender = user_data.gender;
    var dob = user_data.dob;
    var profile = user_data.image;

    if ($(".user_edit_name").val()) {
        username = $(".user_edit_name").val();
    } else if ($(".user_edit_email").val()) {
        alert("Once you update this will be your new username");
        email = $(".user_edit_email").val();
    } else if ($(".user_edit_city").val()) {
        city = $(".user_edit_city").val();
    } else if ($(".user_edit_location").val()) {
        location = $(".user_edit_location").val();
    } else if ($(".user_edit_gender").val()) {
        gender = $(".user_edit_gender").val();
    } else if ($("#datepicker4").val()) {
        dob = $("#datepicker4").val();
    } else if (uploaded_image != '') {
        profile = uploaded_image;
        console.log(uploaded_image);
    }

    $.ajax({
        url : base_url+"/update_user_data",
        type : 'POST', 
        async : false, 
        data : { 'first_name' : username, 'dob' : dob, 'location_id' : location, 'city_id' : city, 'email' : email, 'username' : email, 'gender' : gender, 'image' : profile, 'user_id' : user_data.id, },
        success : function (response) {
            console.log(response);
            var obj = JSON.parse(response);
            console.log(obj);
            followers = obj.followers;
            followings = obj.followings;
            user_data = obj.data;
            var image = '';
            if (user_data.medium == 'facebook') {
                image = user_data.image;
            } else {
                image = image_url+"/"+user_data.image+".jpg";
            }
            display_profileData(image, user_data.id, 'user', followers.length, followings.length);
        }
    })
}

$('.chat-btn').click(function() {
    user_token = user_data.token;
    profileToId = $(this).attr("id");
    console.log(profileToId);
    load_chat_msg(user_token, profileToId);
    $('.main-section').hide();
    $('#chat2').fadeIn();
});


function get_image() {
    navigator.camera.getPicture(onSuccess, onFail, {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
    });
}

function onSuccess(imgUri) {

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

    ft.upload(fileURL, uri, onSuccessf, onErrorf, options);

    function onSuccessf(r) {
        $('.profile_img_name').val('');
        $('.profile_img_name').val(r.response);
        var res_img = r.response;
        uploaded_image = res_img.replace(/\"/g, "");
        $(".upload_image_banner").css("background", "url(" + image_url + "/" + uploaded_image + ".jpg)");
        $(".feed-header").css("background-size", "cover");
        $(".upload_image_banner").addClass("upload_new_image_banner");
        $(".camer_box").hide();
        alert("Image Uploaded Successfully");
    }

    function onErrorf(error) {
        console.log("An error has occurred: Code = " + error.code);
        console.log("upload error source " + error.source);
        console.log("upload error target " + error.target);
        alert("Some Error Occured While image upload please try again");
    }
}


function onFail(message) {
    console.log('Failed because: ' + message);
}


function load_chat_msg(user_token, to_id) {

    Lockr.set('to_id', to_id);
    $(".chat_to_id").val(to_id);

    $.ajax({
        url: base_url + "/get_chat_messages",
        dataType: "json",
        type: "POST",
        data: {
            'token': user_token,
            'to_id': to_id
        },
        success: function(data) {
            console.log(data);
            if (data.status == 'empty') {
                $('.chat_wrapper').html('');
            } else {

                //var reciever_img = '';
                //var sender_img = '';

                $.ajax({
                    url: base_url + "/get_user_detail",
                    dataType: "json",
                    type: "POST",
                    async: false,
                    data: {
                        'token': user_token,
                        'id': to_id
                    },
                    success: function(data) {
                        if (data.data.medium == 'facebook') {
                            reciever_img = '<img id="' + data.data.id + '" src="' + data.data.image + '" class="user_profile_pic">';
                        } else {
                            reciever_img = '<img id="' + data.data.id + '" src="' + image_url + '/' + data.data.image + '.jpg" class="user_profile_pic">';
                        }
                    }
                });

                $.ajax({
                    url: base_url + "/get_user_detail",
                    dataType: "json",
                    type: "POST",
                    async: false,
                    data: {
                        'token': user_token
                    },
                    success: function(data) {
                        if (data.data.medium == 'facebook') {
                            sender_img = '<img id="' + data.data.id + '" src="' + data.data.image + '" class="user_profile_pic">';
                        } else {
                            sender_img = '<img id="' + data.data.id + '" src="' + image_url + '/' + data.data.image + '.jpg" class="user_profile_pic">';
                        }
                    }
                });



                $('.chat_wrapper').html('');
                $('.full_chat_div').html('');

                var chat_time = '';

                $.each(data.data, function(i, v) {
                    var html = '';
                    var new_reciever_img = reciever_img;
                    var new_sender_img = sender_img;

                    var time = v.created_time.split(" ");
                    var created_time = time[0];

                    if (chat_time != created_time) {
                        var time_html = '';
                        time_html += '<div class="mobile-grid-100 day">';
                        time_html += '<p class="chat_time">' + created_time + '</p>';
                        time_html += '</div>';
                        $(".full_chat_div").append(time_html);
                        $(".full_chat_div").append('<div id="' + created_time + '" class="mobile-grid-100 padd0 chat_wrapper"></div>');
                    }
                    chat_time = created_time;
                    console.log(v);
                    if (v.to_id == to_id) {
                        html += '<div class="mobile-grid-100 padd0 chat-section">';
                        html += '<div class="mobile-grid-75 msg-block-image2">';
                        html += '<img src="images/arrow2.png" class="arrow2">';
                        html += '<div class="mobile-grid-100 chatmsg2">';
                        html += '<p>' + v.message + '</p>';
                        html += '</div>';
                        html += '</div>';
                        html += '<div class="mobile-grid-25 user-img">';
                        html += new_sender_img;
                        html += '</div>';
                        html += '</div>';
                    } else {
                        html += '<div class="mobile-grid-100 padd0 chat-section">';
                        html += '<div class="mobile-grid-25 user-img">';
                        html += new_reciever_img;
                        html += '</div>';
                        html += '<div class="mobile-grid-75 msg-block-image">';
                        html += '<img src="images/arrow.png" class="arrow">';
                        html += '<div class="mobile-grid-100 chatmsg">';
                        html += '<p>' + v.message + '</p>';
                        html += '</div>';
                        html += '</div>';
                        html += '</div>';
                    }

                    $('.chat_wrapper[id="' + created_time + '"]').append(html);
                });
            }
            loadNewMsg();
        }
    });
}

function loadNewMsg() {
    var user_token = user_data.token;
    var new_to_id = profileToId;

    $.ajax({
        url: base_url + '/get_new_chat',
        type: 'POST',
        dataType: 'JSON',
        data: {
            'token': user_token,
            'to_id': new_to_id
        },
        success: function(data) {
            if (data.status == 'empty') {

            } else {

                $.ajax({
                    url: base_url + "/get_user_detail",
                    dataType: "json",
                    type: "POST",
                    async: false,
                    data: {
                        'token': user_token,
                        'id': new_to_id
                    },
                    success: function(data) {
                        if (data.data.medium == 'facebook') {
                            reciever_img = '<img id="' + data.data.id + '" src="' + data.data.image + '" class="user_profile_pic">';
                        } else {
                            reciever_img = '<img id="' + data.data.id + '" src="http://casaestilo.in/neonbuzz_admin/upload_image/profile_pic/' + data.data.image + '.jpg" class="user_profile_pic">';
                        }
                    }
                });

                $.ajax({
                    url: base_url + "/last_chat_date",
                    dataType: "json",
                    type: "POST",
                    async: false,
                    data: {
                        'token': user_token,
                        'to_id': new_to_id
                    },
                    success: function(data) {
                        var last_date = data.data.created_time;
                        var new_last_date = last_date.split(" ")[0];
                        Lockr.set('last_chat_time', new_last_date);
                    }
                });

                var last_chat_time = Lockr.get('last_chat_time');

                $.each(data.data, function(i, v) {

                    var html = '';
                    var new_reciever_img = reciever_img;

                    var time = v.created_time.split(" ");
                    var created_time = time[0];

                    if (last_chat_time != created_time) {
                        var time_html = '';
                        time_html += '<div class="mobile-grid-100 day">';
                        time_html += '<p class="chat_time">' + created_time + '</p>';
                        time_html += '</div>';
                        $(".full_chat_div").append(time_html);
                        $(".full_chat_div").append('<div id="' + created_time + '" class="mobile-grid-100 padd0 chat_wrapper"></div>');
                    }
                    last_chat_time = created_time;

                    html += '<div class="mobile-grid-100 padd0 chat-section">';
                    html += '<div class="mobile-grid-25 user-img">';
                    html += new_reciever_img;
                    html += '</div>';
                    html += '<div class="mobile-grid-75 msg-block-image">';
                    html += '<img src="images/arrow.png" class="arrow">';
                    html += '<div class="mobile-grid-100 chatmsg">';
                    html += '<p>' + v.message + '</p>';
                    html += '</div>';
                    html += '</div>';
                    html += '</div>';


                    $('.chat_wrapper[id="' + created_time + '"]').append(html);
                });
            }
            setTimeout(loadNewMsg, 5000);
        }
    })
}

$(".submit_chat").click(function() {
    console.log($(".chat_to_id").val());

    var user_token = user_data.token;
    var to_id_chat = profileToId;
    var message = $('.chat_message').val();

    if (message == '') {
        alert("Message can not be blank");
        console.log("Message can not be blank");
        return false;
    }

    var d = new Date();

    var month = d.getMonth() + 1;
    var day = d.getDate();

    var created_time = d.getFullYear() + '-' +
        (month < 10 ? '0' : '') + month + '-' +
        (day < 10 ? '0' : '') + day;

    $.ajax({
        url: base_url + "/submit_chat_messages",
        dataType: "json",
        type: "POST",
        data: {
            'token': user_token,
            'to_id': to_id_chat,
            'message': message
        },
        success: function(data) {
            if (data.status == 'success') {
                $(".chat_message").val('');

                $.ajax({
                    url: base_url + "/last_chat_date",
                    dataType: "json",
                    type: "POST",
                    async: false,
                    data: {
                        'token': user_token,
                        'to_id': to_id_chat
                    },
                    success: function(data) {
                        console.log('last_chat_date');
                        console.log(data);
                        if (data.status == 'empty') {
                            var new_last_date = created_time;

                            var time_html = '';
                            time_html += '<div class="mobile-grid-100 day">';
                            time_html += '<p class="chat_time">' + created_time + '</p>';
                            time_html += '</div>';
                            $(".full_chat_div").append(time_html);
                            $(".full_chat_div").append('<div id="' + created_time + '" class="mobile-grid-100 padd0 chat_wrapper"></div>');

                        } else {
                            var last_date = data.data.created_time;
                            var new_last_date = last_date.split(" ")[0];
                        }
                        Lockr.set('last_chat_time', new_last_date);
                    }
                });

                var last_chat_time = Lockr.get('last_chat_time');

                console.log(last_chat_time);
                console.log(created_time);


                if (last_chat_time != created_time) {
                    var time_html = '';
                    time_html += '<div class="mobile-grid-100 day">';
                    time_html += '<p class="chat_time">' + created_time + '</p>';
                    time_html += '</div>';
                    $(".full_chat_div").append(time_html);
                    $(".full_chat_div").append('<div id="' + created_time + '" class="mobile-grid-100 padd0 chat_wrapper"></div>');
                }
                last_chat_time = created_time;


                var html = '';
                html += '<div class="mobile-grid-100 padd0 chat-section">';
                html += '<div class="mobile-grid-75 msg-block-image2">';
                html += '<img src="images/arrow2.png" class="arrow2">';
                html += '<div class="mobile-grid-100 chatmsg2">';
                html += '<p>' + message + '</p>';
                html += '</div>';
                html += '</div>';
                html += '<div class="mobile-grid-25 user-img">';
                if (data.data.medium == 'facebook') {
                    html += '<img id="' + data.data.uid + '" src="' + data.data.image + '" class="user_profile_pic">';
                } else {
                    html += '<img id="' + data.data.uid + '" src="' + image_url + '/' + data.data.image + '.jpg" class="user_profile_pic">';
                }
                html += '</div>';
                html += '</div>';

                $('.chat_wrapper[id="' + created_time + '"]').append(html);
            }
        }
    });
});

$("#back-arrow-chat").click(function(){
    $('.main-section').hide();
    $('#chat').fadeIn();
})

$("#feed-page").click(function(){
    displayFeed();
})


$("#offer-page").click(function(){
    displayOffers();
})

$("#show-buzz").click(function(){
    displayBuzz();
    $('.menu').fadeOut('slow');
})

function get_notification_count() {
    var user_token = user_data.token;

    $.ajax({
        url: base_url + '/get_notification_count',
        type: 'POST',
        dataType: 'JSON',
        data: {
            'token': user_token
        },
        success: function(data) {
            console.log(data);
            if (data.status == 'empty') {
                $(".globe_count").html('');
            } else {
                $(".globe_count").html(data.count);

            }

            setTimeout(get_notification_count, 5000);
        }
    })
}

function get_notification() {
    var user_token = user_data.token;

    $.ajax({
        url: base_url + '/get_notification',
        type: 'POST',
        dataType: 'JSON',
        data: {
            'token': user_token
        },
        success: function(data) {
            console.log(data);
            if (data.status == 'empty') {

            } else {
                $(".notification_wrapper").html('');
                $.each(data.data, function(i, v) {
                    var html = '';
                    html += '<div id="' + v.category + '_' + v.category_id + '" class="notification mobile-grid-100 notification_div">';
                    html += '<p class="notify_text1">' + v.created_date + '</p>';
                    html += '<p class="notify_text2">' + v.first_name + ' created ' + v.category + '</p>';
                    //html += '<p class="notify_text3">Last message viewed here!!! Lorum Ipsum </p>';
                    html += '</div>';

                    $(".notification_wrapper").prepend(html);

                    $.ajax({
                        url: base_url + "/update_notification_check",
                        dataType: "json",
                        type: "POST",
                        data: {
                            'token': user_token,
                            'category': v.category,
                            'category_id': v.category_id
                        },
                        success: function(data) {}
                    });
                });
            }
            //setTimeout(get_notification, 5000);
        }
    })

}
    // var fxp1 = 0 ;
    // $('#fp1').unbind('click');
    // $('#fp1').bind('click', function() {
    // if(fxp1==0){ 
    //    $('#ff1').fadeIn();
    //    $('#fd1').fadeIn();
    //    fxp1=1;
    // }else if(fxp1==1){
    //    $('#ff1').fadeOut();
    //    $('#fd1').fadeOut();
    //    fxp1=0;
    // }
// });