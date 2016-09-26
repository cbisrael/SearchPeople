
var FILE_SIZE;
var BYTES_PER_CHUNK = 77570;
var m_start_read = 0;
var m_end_read = BYTES_PER_CHUNK;
var m_completed = 0;

var m_submitting_person_data = false;
var m_validator;
$(document).ready(function () {
    $("#create_pereson").on("click", function () {
        //Purpose: Show Create Person dialog box when the Create New is clicked
        //Input:   None
        //OUtput:  None
        show_modal(true, "#myModal");
    })
    

    $("#do_search").on("click", function () {
        //Purpose: execute the the search by using the value that is typed in person_name input box
        //Input:   None
        //Output:  String html populating the the_data div with a table formatted output

        //disable Search button to prevent sending ajax request multiple times before the first
        //sendoff is finished.
        this.disabled = true;
        //Show the waiting gears
        show_wait(true);
        //reset the tbody part of the table
        $("#people_power").html("");
        //format jason request
        var _data = {
            person_name: $("#person_name").val(),
            delay: $("#delay").val()
        };
        var _sendData = JSON.stringify(_data);
        //ajax call to SearchPeople control to fetch the data.
        $.ajax({
            url: "/Home/SearchPeople",
            type: "POST",
            data: _sendData,
            datatype: "json",
            contentType: "application/json; charset=utf-8",
            cache: false,
            success: function (ret_data) {
                //hide waiting gears
                show_wait(false);
                //format and output JSON returned data
                output_person_records(ret_data);
                //enable search button
                $("#do_search").prop("disabled", false);
            },
            error: function (ret_data) {
                //hide waiting gears
                show_wait(false);
                //enable search button
                $("#do_search").prop("disabled", false);                
                alert(ret_data);
            }
        })
    });

    
    $("#fleUpload").change(function () {
        //Purpose: Call the show_image to render the image the user selected on the
        //         Create/Update person dialog box
        //Input:   None
        //Output:  Show the picture on the Create/Update user dialog box
        if (window.FormData !== undefined) {
            show_image();
        }
    });

    //Add pictures routine
    $("#addpics").on("click", function () {
        $('#fleUpload').click();
    });

    $("#myModal").on("hidden.bs.modal", function () {
        //Purpose: Clear the fields and the picture from the Create/Update person dialog box
        //         when its display attribute is none.  It also resets the validation of the form
        //         keeping it clean
        //Input:     None
        //Output:   Cleared fields, control, and residual validation error messages.
        clear_fields();
        m_validator.resetForm();
    });
    
    $("#person_data").submit(function (event) {
        //stop submission of form
        event.preventDefault();
    });

    $("#person_name").on("keypress", function (e) {
        //do the search if the user hits the enter key
        if (e.keyCode == 13)
            $("#do_search").click();
    });

    //some simple validation to make the first name and last name required.  if they are supplied,
    //the submitHandler function will fire to save the  picture and the person information into the
    //file directries and the database
    var _perdat = document.getElementById("person_data");
    if (_perdat !== null) {
        m_validator = $("#person_data").validate({
            rules:
                {
                    upd_firstname:
                        {
                            required: true
                        },
                    upd_lastname:
                        {
                            required: true
                        }
                },
            messages:
                {
                    upd_firstname: "Please enter first name",
                    upd_lastname: "Please enter last name"
                },
            submitHandler: function () {
                if (!m_submitting_person_data) {
                    m_submitting_person_data = true;
                    var fileUpload = $("#fleUpload").get(0);
                    var files = fileUpload.files;
                    //if there is a picture attached to the person data, then upload the file
                    //then save the person data.  otherwise, we just send the person data.
                    if (files.length > 0)
                        upload_files();
                    else
                        send_person_data($("#upd_pic_path").val());
                }
            }
        });
    }
})

function output_person_records(data)
{
    //Purpose: Format the data returned by the ajax call to SearchPeople into a spreadsheet form
    //Input:   data - Json object containing person data
    //Output:  string html spreadsheet data

    //We map the data into an array, join the contents of the array, then append the html to the 
    //people_power tbody
    $("#people_power").append(
        $.map(data, function (ignore, index) {
            var _html = "<tr><td style='vertical-align: middle'>" + get_pic(data[index].pic_path) + "</td>" +
                "<td style='vertical-align: middle'>" + trim_data(data[index].first_name) + "</td>" +
                "<td style='vertical-align: middle'>" + trim_data(data[index].last_name) + "</td>" +
                "<td style='vertical-align: middle'>" + trim_data(data[index].address) + "<br/>" + trim_data(data[index].city) +
                trim_data(data[index].state) + ", " + trim_data(data[index].zip) + "</td>" +
                "<td style='vertical-align: middle'>" + (data[index].age == null ? "" : data[index].age) + "</td>" +
                "<td style='vertical-align: middle'>" + trim_data(data[index].interests) +
                "</td><td style='vertical-align: middle'><a href='#' id='" + data[index].iperson + "' onclick='query_person(this)'>Edit</a></tr>";
            return _html;

        }).join()
     );
}

function get_pic(pic)
{
    //Purpose: Examine if the person has a picture or not.  If they have a picture, format it to
    //         and image object to show their picture.  Otherwise, reference the nopic.jpg which
    //         is an empty head jpeg image to be the image object.
    //Input:   pic - string data referencing the picture file
    //Output:  string html image object.
    var _imghtml = "";
    if (pic == null)
        _src = "/pictures/nopic.jpg";
    else
        _src = pic;
    return "<img src='" + _src + "' class='img-circle people_pic'/>";
}

function send_person_data(fle_name) {
    //Purpose: Ajax call to send the json person data returned by pack_person_data subroutine.
    //Input:   string fle_name - the actual file name of the picture chosen by the user.  this is
    //         significant to the UpdatePeople action to get the file's proper extension.
    //Output:  None 
    var _data = pack_person_data(fle_name);
    $.ajax({
        url: "/Home/UpdatePeople",
        type: "POST",
        data: JSON.stringify(_data),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            clear_fields();
            alert(data);
            m_submitting_person_data = false;
        },
        error: function (data) {
            m_submitting_person_data = false;
            alert(data);
        }
    });
}

var pack_person_data = function(fle_name)
{
    //Purpose: format the json object request for crate/update person
    //Input: string fle_name
    //Output:  json object pers
    var pers = {
        "iperson": $("#upd_iperson").val(),
        "first_name": $("#upd_firstname").val(),
        "last_name": $("#upd_lastname").val(),
        "sort_name": $("#upd_firstname").val() + ' ' + $("#upd_lastname").val(),
        "address": $("#upd_address").val(),
        "city": $("#upd_city").val(),
        "zip": $("#upd_zip").val(),
        "state": $("#upd_state").val(),
        "age": $("#upd_age").val(),
        "interests": $("#upd_interests").val(),
        "pic_path": fle_name
    }
    return pers;
}
var clear_fields = function () {
    //Purpose: Clear the fields of the Craete/Update person dialog box
    //Input:   None
    //Output:  None

    //clear textbox and drop down controls
    $("#upd_firstname").val("0");
    $("#upd_firstname").val("");
    $("#upd_lastname").val("");
    $("#upd_address").val("");
    $("#upd_city").val("");
    $("#upd_zip").val("");
    $("#upd_state").val("");
    $("#upd_age").val("");
    $("#upd_interests").val("");

    //clear image
    var images = document.getElementById('images');
    //remove child nodes of the picture div.  we add an invisible span to prevent the subsequent call
    //to image.removeChild.  this is a lazy of doing this.  could have inspected child count.
    images.removeChild(images.firstChild);
    var _span = document.createElement('span');
    $(_span).css("display", "none");
    images.appendChild(_span);
}

//the entry point of uploading files
function upload_files() {
    //Purpose: Entry poin tof child upload.  It calls upload_chunk where upload_chunk calls peforms
    //         recursive calls to upload the picture in chunks.
    //Input:   None
    //Output:  None
    if (window.FormData !== undefined) {
        var fileUpload = $("#fleUpload").get(0);
        var files = fileUpload.files;
        var file_cnt = files.length;

        if (file_cnt > 0) {
            FILE_SIZE = files[0].size;
            upload_chunk(files[0]);
        }
    }
}

function uploadComplete(_file) {
    //Purpose: Called when the picture is completely uploaded to the server.  It will then reset the 
    //         variables used to upload the picture file and proceed to call send_person_data to send
    //         the person data to the /Home/UpdatePeople controller/action.  It will reset the 
    //         fileUpload file input data
    //Input:   _fle blob - the actual blob file
    //Output:  None
    
    var fleinfo = {"fileName": _file.name, "completed": true}

    var xhr2 = new XMLHttpRequest();
    xhr2.onload = function () {
     init_post();
    };
    xhr2.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            //Now we commit the text data to database             
            send_person_data(xhr2.responseText);
            $("#fleUpload").val("");
        }
        else
            m_submitting_person_data = false;
    }
    xhr2.open("POST", "/Home/UploadComplete", true); //combine the chunks together
    xhr2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr2.send(JSON.stringify(fleinfo));    
}

function upload_chunk(file) {
    //Purpose:  Upload the file in bytes as specified in BYTES_PER_CHUNK constant.  It will 
    //          recursively calls itself until the whole file is uploaded; then it will call
    //          uploadComplete routine
    //Input:    file - the actual blob picture file.
    //Output:   None

    var blob = file;
    //Calculate the number of calls to completely upload the file
    var count = FILE_SIZE % BYTES_PER_CHUNK == 0 ? FILE_SIZE / BYTES_PER_CHUNK : Math.floor(FILE_SIZE / BYTES_PER_CHUNK) + 1;
    //get a chunk
    var chunk = blob.slice(m_start_read, m_end_read);

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        m_completed = m_completed + 1;
        if (m_completed === count) {
            uploadComplete(file);
        }
        else {
            if (m_start_read < FILE_SIZE)
                upload_chunk(file); //recursive call until the whole file is uploaded
        }
    };

    xhr.onreadystatechange = function () {
        if (this.readyState !== 4 && this.status !== 200) {
            //reset this variable to allow the user to submit another person
            //this variable is a preventive mechanism for the user to submit data
            //multiple times.
            m_submitting_person_data = false;
        }
    };

    //we go ahead and upload to the stream.
    //chunk = blob.slice(m_start_read, m_end_read);
    xhr.open("POST", "/Home/MultiUpload", true);
    xhr.send(chunk);
    //we readjust start of read and the end for the next chunk.
    m_start_read = m_end_read;
    m_end_read = m_start_read + BYTES_PER_CHUNK;

}

var init_post = function () {
    m_end_read = BYTES_PER_CHUNK;
    m_completed = 0;
    m_start_read = 0;
}

function query_person(_href)
{
    //Purpose: Called when Edit link is clicked.  It will call Edit action to query
    //         the specified id from the Edit link id attribute.
    var id = $(_href).attr("id")
    $("#upd_iperson").val(id);
    var _data = {
        "iperson": id
    }    
    $.ajax({
        url: "/Home/Edit",
        type: "POST",
        data: JSON.stringify(_data),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            //clear the Crate/Update Person page and then populate the data
            //that came from the back-end
            clear_fields();
            $("#upd_firstname").val(trim_data(data.first_name));
            $("#upd_lastname").val(trim_data(data.last_name));
            $("#upd_address").val(trim_data(data.address));
            $("#upd_city").val(trim_data(data.city));
            $("#upd_zip").val(trim_data(data.zip));
            $("#upd_state").val(trim_data(data.state));
            $("#upd_age").val(trim_data(data.age));
            $("#upd_interests").val(trim_data(data.interests));
            $("#upd_pic_path").val(trim_data(data.pic_path));
            var _imghtml = "<img src='" + trim_data(data.pic_path) + "' class='fixed-ratio-resize'/>";
            $("#images").html(_imghtml);
            show_modal(true, "#myModal");
        },
        error: function (data) {
            alert(data);
        }
    });
}

//utilities
function show_modal(show_it, modal_name) {
    //Purpose: show modal form
    //Input: show_it - boolean; if true it will show dialog box otherwise it will hide dialog box
    //       model_name - the bootstrap dialog id
    //Output: none
    if (window.FormData !== undefined) {
        if (show_it) {
            $(modal_name).modal({
                show: true,
                keyboard: true
            });
        }
        else {
            $(modal_name).modal('hide');
        }
    }
}

function show_image() {
    //Purpose: Render the image that the user selected 
    //Input:   None
    //Output:  the imege is rendered on the Create/Update Person dialog box.
    var fileUpload = $("#fleUpload").get(0);
    var files = fileUpload.files;
    var j = 0;
    var k = 0;
    var file_count = files.length;
    var i = 0;
    var images = document.getElementById('images');
    if (file_count > 0)
    {
        //remove child nodes
        images.removeChild(images.firstChild);
        var _img = document.createElement('img');
        _img.src = URL.createObjectURL(files[0]);
        _img.className = "fixed-ratio-resize";
        images.appendChild(_img);
    }
      
    
}

function show_wait(showit)
{
    //Purose: Show or hide the turning gears when an ajax call is issued
    //Input:  showit - boolean; shows the gears if true and hide it otherwise
    center_gears();
    if (showit)
    {
        $("body").css("cursor", "progress");
        $("#gears_of_wait").css("display", "block");
    }       
    else
    {
        $("body").css("cursor", "default");
        $("#gears_of_wait").css("display", "none");
    }
}

function center_gears() {
    //Purpose: Center the animated turning gears
    //Input:   None
    //Output:  None
    var _gears = document.getElementById("gears_of_wait");
    
    var left = (window.innerWidth / 2) - (_gears.clientWidth / 2);
    var top = (window.innerHeight / 2) - (_gears.clientHeight / 2);

    _gears.style.top = String(top) + "px";
    _gears.style.left = String(left) + "px";
    
}

function trim_data(_totrim)
{
    //Purpose: Trim a string data so that the leading and trailing white spaces are eliminated
    //Input:   _totrim - string variable to be trimmed
    //Output:  ret_val - string; the trimmed data.  
    var ret_val = "";
    if(_totrim !== null)
    {
        _totrim = String(_totrim);
        ret_val = _totrim.trim();
    }
    return ret_val;
        
}