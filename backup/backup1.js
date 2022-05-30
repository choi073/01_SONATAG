/////////////////////////////////////////////////////////////////////////////////////////////////////// 페이지 보여주기
///////////////////////////////////////////////////////////////////////////////////////////////////////
// var last_top = 0;
// $(window).scroll(function () {
//     var this_top = $(this).scrollTop();
//     if (this_top > last_top) {
//         $(".navbar").addClass("hide");
//     } else {
//         $(".navbar").removeClass("hide");
//     }
//     last_top = this_top;
//
// });

$(document).ready(function () {
    log_chk()
    // $(".page").hide()
    $(".popup").hide()
    index()
    $("#period-nav").hide()

    $("#about").click(function () {
        window.open("https://morningpower.tistory.com/2");
    });


    $("#keyShow").on("click", function () {
        if ($(".PW").attr("type") == "password") {
            $(".PW").attr("type", "text");
            $($(this)).text("HIDE");
        } else {
            $(".PW").attr("type", "password");
            $($(this)).text("SHOW");
        }
    });

    $("#keyShow2").on("click", function () {
        if ($(".PW").attr("type") == "password") {
            $(".PW").attr("type", "text");
            $($(this)).text("HIDE");
        } else {
            $(".PW").attr("type", "password");
            $($(this)).text("SHOW");
        }
    });


    $("#showperiod").click(function () {
        $("#period").show()
        $(".page").not("#period").hide()

        var submenu = $("#period-nav")
        if (submenu.is(":visible")) {
            submenu.slideUp();
        } else {
            submenu.slideDown();
        }
    });


});

function enterLogin() {
    if (window.event.keyCode == 13) {
        login();
    }
}

function enterSignup() {
    if (window.event.keyCode == 13) {
        register();
    }
}

function enterSearch() {
    if (window.event.keyCode == 13) {
        searchResult();
    }
}

function index() {
    $("#intro").show()
    $(".page").not("#intro").hide()
    $("#period-nav").hide()
    $("#library").hide()
    $("#library-result-box2").hide()
}

// function Search() {
//     $("#search-key").hide()
//     $("#search").show()
//     $(".page").not("#search").hide()
//     $("#period-nav").hide()
// }

function popular() {
    showPop()
    $("#library").hide()
    $("#library-result-box2").hide()
    $("#popular").show()
    $(".page").not("#popular").hide()
    $("#period-nav").hide()
}

function show_moreInfo(id) {
    moreInfo(id)
    $("#library").hide()
    $("#library-result-box2").hide()
    $("#more-info").show()
    $("#search-cards").hide()
    $("#search-result-box").hide()
    $("#search-key").hide()

    // $(".page").not("#more-info").hide()
    // $("#period-nav").hide()
}

function show_library() {
    $("#library").show()
    $(".page").not("#library").hide()
    $("#period-nav").hide()
    if ($.cookie('mytoken') == undefined) {
        alert('로그인이 필요합니다')
        show_login()
    } else {
        $.ajax({
            type: "GET",
            url: "/api/name",
            headers: {'token_give': $.cookie('mytoken')},
            data: {},
            success: function (response) {
                if (response['result'] == 'success') {
                    let user = response['name']
                    $('#name').text(user)
                    library(user);
                    totalTag(user)
                } else {
                    alert(response['msg'])
                    show_login()
                }
            }
        })
    }
}

function show_login() {
    $("#login").show()
    $(".page").not("#login").hide()
    $("#period-nav").hide()
}

function show_register() {
    $("#register").show()
    $(".page").not("#register").hide()
    $("#period-nav").hide()
}

function show_popup_save() {
    $("#popup-save").show()
    $(".popup").not("#popup-save").hide()
}

function show_popup_edit() {
    $("#popup-edit").show()
    $(".popup").not("#popup-edit").hide()
}

function show_popup_delete() {
    $("#popup-delete").show()
    $(".popup").not("#popup-delete").hide()
}

function close_popup() {
    $(".popup").hide()
}


/////////////////////////////////////////////////////////////////////////////////////////////////////// 로그인
///////////////////////////////////////////////////////////////////////////////////////////////////////

function log_chk() {
    if ($.cookie('mytoken') == undefined) {
    } else {
        $("#nav-log").text("Log Out");
        $("#nav-log").click(function () {
            logout()
        });
    }
}


function logout() {
    $.removeCookie('mytoken');
    alert('로그아웃!')
    window.location.reload()
}

function login() {
    $.ajax({
        type: "POST",
        url: "/api/login",
        data: {id_give: $('#userid').val(), pw_give: $('#userpw').val()},
        success: function (response) {
            if (response['result'] == 'success') {
                $.cookie('mytoken', response['token']);
                alert('로그인 완료!')
                window.location.reload()
                index()

            } else {
                alert(response['msg'])
            }
        }
    })
}

/////////////////////////////////////////////////////////////////////////////////////////////////////// 회원가입
///////////////////////////////////////////////////////////////////////////////////////////////////////

function register() {
    $.ajax({
        type: "POST",
        url: "/api/register",
        data: {
            id_give: $('#userid2').val(),
            pw_give: $('#userpw2').val(),
        },
        success: function (response) {
            if (response['result'] == 'success') {
                alert('회원가입이 완료되었습니다.')
                index()
            } else {
                alert(response['msg'])
            }
        }
    })
}

/////////////////////////////////////////////////////////////////////////////////////////////////////// 회원확인
///////////////////////////////////////////////////////////////////////////////////////////////////////


function checkLogin(workid) {
    if ($.cookie('mytoken') == undefined) {
        alert('로그인이 필요한 서비스 입니다.')
        close_popup()
        show_login()
    } else {
        load_user_info(workid)
    }
}

function load_user_info(workid) {
    $.ajax({
        type: "GET",
        url: "/api/name",
        headers: {'token_give': $.cookie('mytoken')},
        data: {},
        success: function (response) {
            if (response['result'] == 'success') {
                let user = response['name']
                btn_save(user, workid);

            } else {
                alert(response['msg'])
                close_popup()
                show_login()
            }
        }
    })
}


/////////////////////////////////////////////////////////////////////////////////////////////////////// 팝업
///////////////////////////////////////////////////////////////////////////////////////////////////////

function btn_save(username, workid) {
    show_popup_save()
    let tempHtml3 = `
                  <a class="O" onclick="save_api('${username}','${workid}')">save</a>
                `;
    $("#btn-save").append(tempHtml3);
}

function save_api(username, workid) {
    let tags = $('#tags-save').val()
    $.ajax({
        type: 'POST',
        url: '/api/save',
        data: {
            'id_give': workid,
            'user_give': username,
            'tags_give': tags,
        },
        success: function (response) {
            if (response['result'] == 'success') {
                let msg = response['msg']
                alert(msg)
                close_popup()
            } else {
                let msg = response['msg']
                alert(msg)
                close_popup()
            }
        }
    })
}


function btn_edit(user, workid) {
    show_popup_edit()
    let tempHtml3 = `
                  <a class="O" onclick="edit_api('${user}','${workid}')">edit</a>
                `;
    $("#btn-edit").append(tempHtml3);

}

function edit_api(user, workid) {
    let tags = $('#tags-edit').val()
    $.ajax({
        type: "POST",
        url: "/api/tag/edit",
        data: {
            'user_give': user,
            'workid_give': workid,
            'tags_give': tags,
        },
        success: function (response) {
            if (response['result'] == 'success') {
                let msg = response['msg']
                alert(msg)
                window.location.reload()
                show_library()
            }
        }
    })
}

function btn_delete(user, workid) {
    show_popup_delete()
    let tempHtml4 = `
                        <a class="O" onclick="delete_api('${user}','${workid}')">yes</a>
                                        `;
    $("#btn-delete").append(tempHtml4);
}

function delete_api(user, workid) {
    $.ajax({
        type: "POST",
        url: "/api/tag/delete",
        data: {
            'user_give': user,
            'workid_give': workid,
        },
        success: function (response) {
            if (response['result'] == 'success') {
                let msg = response['msg']
                alert(msg)
                window.location.reload()
                show_library()


            }
        }
    })
}


/////////////////////////////////////////////////////////////////////////////////////////////////////// 검색
///////////////////////////////////////////////////////////////////////////////////////////////////////

function searchResult() {
    $("#search-key").show()
    $("#search-cards").empty()
    $("#search-result-box").empty()
    // $("#search-key").hide()
    $("#search").show()
    $(".page").not("#search").hide()
    $("#period-nav").hide()
    $("#search-cards").show()
    $("#search-result-box").show()
    $("#search-key").show()

    let searchWord = $('#search-bar').val()
    if ($("#search-result-box") !== null) {
        count = 0
    }

    $.ajax({
        type: 'POST',
        url: '/api/search',
        data: {
            'search_give': searchWord,
            'searchkey_give': 0,
        },
        success: function (response) {
            if (response['result'] == 'success') {
                let searchResults = response['search_results']
                for (let i = 0; i < searchResults.length; i++) {
                    let composers = searchResults[i]['composer']
                    let name = composers['name']
                    let fullname = composers['complete_name']
                    let birth = composers['birth'].split('-')[0]
                    let death = composers['death'].split('-')[0]
                    let id = composers['id']
                    let epoch = composers['epoch']
                    let portrait = composers['portrait']
                    let works = searchResults[i]['work']
                    if (!works) {
                        let tempHtml = `
                                 <div class="cards" onclick="show_moreInfo('${id}')">
                                              <div class="card-portrait">
                                                    <img class="card-img" src="${portrait}" alt="Card image cap">
                                                </div>
                                                <div class="card-content">
                                                                <p>
                                                                <h2 class="card-title" style="float: left">${name}</h2>
                                                                <h4 class="card-text" >\t&nbsp;(${birth}~${death})</h4>
                                                                </p>

                                                                <h3 class="card-text"style="float: left">${fullname}<br>${epoch}</h3>
<!--                                                                
                                                </div>

                                </div>
                                <hr class="hr1">
                                             `;
                        $("#search-cards").append(tempHtml);
                    } else {
                        let work_id = works['id']
                        let title = works['title']
                        let tempHtml2 = `
                                            <div class="search-result-grid">
                                             <h5>${name} - ${title}</h5>
                                           <a class="save" onclick="checkLogin('${work_id}')">+</a>
                                            </div>
                                            <hr class="hr2">
                                            
                                         
                                            `
                        $("#search-result-box").append(tempHtml2);

                    }
                }
            } else {
                let searchResults = response['msg']
                alert(searchResults)

            }
        }
    });
}

let count = 0

function searchkeyCount() {
    count++
    $('#search-key').val(count);
    let searchkey = $('#search-key').val()
    let searchWord = $('#search-bar').val()
    $.ajax({
        type: 'POST',
        url: '/api/search',
        data: {
            'search_give': searchWord,
            'searchkey_give': searchkey,
        },
        success: function (response) {
            if (response['result'] == 'success') {
                let searchResults = response['search_results']
                for (let i = 0; i < searchResults.length; i++) {
                    let composers = searchResults[i]['composer']
                    let name = composers['name']
                    let works = searchResults[i]['work']
                    if (works) {
                        let work_id = works['id']
                        let title = works['title']
                        let tempHtml2 = `
                                             <div class="search-result-grid">
                                             <h5>${name} - ${title}</h5>
                                           <a class="save" onclick="checkLogin('${work_id}')">+</a>
                                            </div>
                                            <hr class="hr2">
                                          
                                            `
                        $("#search-result-box").append(tempHtml2);

                    }
                }
            } else {
                let searchResults = response['msg']
                alert(searchResults)

            }
        }
    })
}


/////////////////////////////////////////////////////////////////////////////////////////////////////// 인기
///////////////////////////////////////////////////////////////////////////////////////////////////////

function showPop() {
    $("#pop-cards").empty()
    $("#library").hide()
    $("#library-result-box2").hide()
    $.ajax({
        type: 'GET',
        url: '/api/pop',
        data: {},
        success: function (response) {
            if (response['result'] == 'success') {
                let popList = response['popList'];
                for (let i = 0; i < popList.length; i++) {
                    let composer = popList[i]
                    let id = composer['id']
                    let name = composer['name']
                    let fullname = composer['complete_name']
                    let birth = composer['birth'].split('-')[0]
                    let death = composer['death'].split('-')[0]
                    let epoch = composer['epoch']
                    let portrait = composer['portrait']
                    let temp_html = `
                                <div class="cards" onclick="show_moreInfo('${id}')">
                                    <div class="card-portrait">
                                        <img class="card-img" src="${portrait}" alt="Card image cap">
                                        <div class="card-name">${name}</div>
                                        </img>
                                    </div>
                                </div>
                                `

                    $("#pop-cards").append(temp_html)

                }
            }
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////////////////////// 시대별 리스트
///////////////////////////////////////////////////////////////////////////////////////////////////////
function periodList(word) {
    $("#library").hide()
    $("#library-result-box2").hide()
    $("#period-list").show()
    $(".page").not("#period-list").hide()
    $("#period-cards").empty()
    $.ajax({
        type: 'POST',
        url: '/api/period',
        data: {'period_give': word},
        success: function (response) {
            if (response['result'] == 'success') {
                let composers = response['periodList'];
                for (let i = 0; i < composers.length; i++) {
                    let composer = composers[i]
                    let id = composer['id']
                    let portrait = composer['portrait']
                    let name = composer['name']
                    let fullname = composer['complete_name']
                    let epoch = composer['epoch']
                    let birth = composer['birth'].split('-')[0]
                    let deathdata = composer['death']
                    if (deathdata == null) {

                        let temp_html = `
                                <div class="cards" onclick="show_moreInfo('${id}')">
                                    <div class="card-portrait">
                                        <img class="card-img" src="${portrait}" alt="Card image cap"> 
                                        <div class="card-name">${name}</div>
                                        </img>
                                    </div>
                                </div>
                                `

                        $("#period-cards").append(temp_html);


                    } else {
                        let death = deathdata.split('-')[0]
                        let temp_html = `
                                <div class="cards" onclick="show_moreInfo('${id}')">
                                    <div class="card-portrait">
                                        <img class="card-img" src="${portrait}" alt="Card image cap"> 
                                        <div class="card-name">${name}</div>
                                        </img>
                                    </div>
                                </div>
                                `

                        $("#period-cards").append(temp_html);

                    }
                }
            }
        }
    });
}


/////////////////////////////////////////////////////////////////////////////////////////////////////// 상세 페이지
///////////////////////////////////////////////////////////////////////////////////////////////////////
function moreInfo(id) {
    $("#library").hide()
    $("#library-result-box2").hide()
    $("#more-cards").empty()
    $("#more-result-box").empty()
    $("#library-result-box2").hide()
    $.ajax({
        type: 'POST',
        url: '/api/more',
        data: {'id_give': id},
        success: function (response) {
            if (response['result'] == 'success') {
                let more = response['more'];
                let composers = more['composer']
                let portrait = composers['portrait']
                let name = composers['name']
                let fullname = composers['complete_name']
                let epoch = composers['epoch']
                let birth = composers['birth'].split('-')[0]
                let deathdata = composers['death']

                if (!deathdata) {
                    let tempHtml3 = `
                            <div class="cards2">
                                   
                                   <div></div>
                                   
                                    <div class="card-portrait2">
                                                    <img class="card-img2" src="${portrait}" alt="Card image cap">
                                    </div>
                                    <div></div>
                                    <div></div>
                                    <div class="card-content2">
                                                    <p>
                                                    <h2 class="card-title" style="float: left">${name}</h2>
                                                    <h4 class="card-text">\t&nbsp;(${birth}~)</h4>
                                                    </p>

                                                    <h3 class="card-text">${fullname}</h3>
                                                    <h3 class="card-text">${epoch}</h3>
                                    </div>
                                    <div></div>
                                </div>
                                <hr class="hr1">
                            `
                    $("#more-cards").append(tempHtml3);
                } else {
                    let death = deathdata.split('-')[0]
                    let tempHtml2 = `
                             <div class="cards2">
                                    <div></div>
                                   
                                    <div class="card-portrait2">
                                                    <img class="card-img2" src="${portrait}" alt="Card image cap">
                                    </div>
                                    <div></div>
                                    <div></div>
                                    <div class="card-content2">
                                                    <p>
                                                    <h2 class="card-title" style="float: left">${name}</h2>
                                                    <h4 class="card-text">\t&nbsp;(${birth}~${death})</h4>
                                                    </p>

                                                    <h3 class="card-text">${fullname}</h3>
                                                    <h3 class="card-text">${epoch}</h3>
                                    </div>
                                    <div></div>
                                </div>
                                <hr class="hr1">
                            `
                    $("#more-cards").append(tempHtml2);
                }
                let works = more['works']
                for (let i = 0; i < works.length; i++) {
                    let work = works[i]
                    if (work) {
                        let title = work['title']
                        let work_id = work['id']
                        let tempHtml = `<div class="more-grid">
                                            <h5>${name} - ${title}</h5>
                                            <a class="save" onclick="checkLogin('${work_id}')">+</a>
                                        </div>
                                            <hr class="hr2">
                                        
                                       `;


                        $("#more-result-box").append(tempHtml);
                    }
                }
            }
        }
    });
}


/////////////////////////////////////////////////////////////////////////////////////////////////////// 라이브러리
///////////////////////////////////////////////////////////////////////////////////////////////////////

function library(user) {
    $("#allbtn").empty();
    $("#tagbtn").empty();
    $("#library-result-box2").empty();
    $("#library-result-box2").show()
    $.ajax({
        type: "POST",
        url: "/api/library",
        data: {'user_give': user},
        success: function (response) {
            if (response['result'] == 'success') {
                let works = response['worksList']
                for (let i = 0; i < works.length; i++) {
                    let work = works[i]
                    let workid = work['id']
                    let title = work['title']
                    let name = work['name']
                    let tags = work['tags'].replace(/\s/gi, "")
                    let temp_html = `
                                           <div class="library-grid">
                                              <h5>${name} - ${title} <span id="tags">${tags}</span> </h5>
                                   <a class="edit" onclick="btn_edit('${user}', '${workid}')" >E</a>
                                   <a class="del" onclick="btn_delete('${user}', '${workid}')">-</a></li>
                                   </div>
                                   <hr class="hr2">
                                            `
                    $("#library-result-box2").append(temp_html);
                }
            }
        }
    })
}


function allTag(user) {
    $("#library-result-box2").empty();
    $.ajax({
        type: "POST",
        url: "/api/library",
        data: {'user_give': user},
        success: function (response) {
            if (response['result'] == 'success') {
                let works = response['worksList']
                for (let i = 0; i < works.length; i++) {
                    let work = works[i]
                    let workid = work['id']
                    let title = work['title']
                    let name = work['name']
                    let tags = work['tags'].replace(/\s/gi, "")
                    let temp_html = `
                                           <div class="library-grid">
                                              <h5>${name} - ${title} <span id="tags">${tags}</span> </h5>
                                   <a class="edit" onclick="btn_edit('${user}', '${workid}')" >E</a>
                                   <a class="del" onclick="btn_delete('${user}', '${workid}')">-</a></li>
                                     </div>
                                   <hr class="hr2">
                                            `
                    $("#library-result-box2").append(temp_html);
                }
            }
        }
    })
}

function totalTag(user) {
    $.ajax({
        type: "POST",
        url: "/api/tag",
        data: {'user_give': user},
        success: function (response) {
            if (response['result'] == 'success') {
                let tags = response['tags']
                let temp_html1 = `<label class="checkbox">
                                    <input type="button" id="allbtn" onclick="allTag('${user}')" >
                                    <span class="checkbox_icon">All</span>
                                     </label>
                                    `
                $("#tagbtn").append(temp_html1);

                $("#allbtn").click(function () {
                    $("input:checkbox[id='tagbtn']").prop("checked", false);
                })

                for (let i = 0; i < tags.length; i++) {
                    let tag = tags[i]
                    let temp_html2 = `<label class="checkbox">
                                     <input type="checkbox" id="tagbtn" class="chkselect" name="chk" onclick="tagSelect('${user}')" value='${tag}'>
                                     <span class="checkbox_icon">${tag}</span>
                                     </label>
                                            `
                    $("#tagbtn").append(temp_html2);
                }
                let temp_html3 = `
                <label class="checkbox">
                        <input type="checkbox" class="tag-include" id="tag-include">
                        <span class="checkbox_icon">선택된 태그 모두
                    포함하기</span>
                    </label>
                `
                $("#tagbtn").append(temp_html3);
            }
        }
    })
}


function tagSelect(user) {
    $("#library-result-box2").empty();
    let result = Array();
    let cnt = 0;
    let chkbox = $(".chkselect");
    for (i = 0; i < chkbox.length; i++) {
        if (chkbox[i].checked == true) {
            result[cnt] = chkbox[i].value;
            cnt++;
        }
    }
    $('#result').val(result);

    //태그 모두 포함하기
    let tag_include_chk = $('#tag-include').is(':checked')
    $("#tag-include").click(function () {
        $("input:checkbox[id='tagbtn']").prop("checked", false);
    })


    $.ajax({
        type: "POST",
        url: "/api/tag/select",
        data: {
            'user_give': user,
            'tag_give': result,
            'tag_include_give': tag_include_chk,
        },
        success: function (response) {
            if (response['result'] == 'success') {
                let workResult = response['workResult']
                for (let i = 0; i < workResult.length; i++) {
                    let work = workResult[i]
                    let workid = work['id']
                    let name = work['name']
                    let title = work['title']
                    let tags = work['tags'].replace(/\s/gi, "")
                    let temp_html = `
                                           <div class="library-grid">
                                              <h5>${name} - ${title} <span id="tags">${tags}</span> </h5>
                                   <a class="edit" onclick="btn_edit('${user}', '${workid}')" >E</a>
                                   <a class="del" onclick="btn_delete('${user}', '${workid}')">-</a></li>
                                     </div>
                                   <hr class="hr2">
                                 
                                    `
                    $("#library-result-box2").append(temp_html);
                }
            }
        }
    })
}
