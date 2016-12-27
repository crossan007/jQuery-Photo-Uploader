(function( $ ) {

  var parameters ={};
  var canvas = {};
  var context = {};

  $.fn.PhotoUploader = function (userParameters) {
    
    parameters = $.extend( {}, $.fn.PhotoUploader.defaultParameters, userParameters );
    canvas = $("<canvas>",{
      id:"canvas"
    })
    .attr("width", parameters.photoWidth)
    .attr("height", parameters.photoHeight);

    context = canvas.get(0).getContext("2d");

    this.append(createModal());

    $("#upload-image").on("hidden.bs.modal", function() {
     stopVideo();
     $("#previewPane").empty();
    });

    this.show = function()
    {
      $("#upload-image").modal("show");
    }
    return this;
  }

  function fileSelectChanged(fileSelect)
  {
    
    var file = fileSelect.target.files[0];
    if (!file.type.match('image.*')) {
      return;
    }

    $("#previewPane").empty().append( 
      $("<div>",{
        class: "col-md-12",
        id:"photoPreview"
      }).append(
        canvas
    ));
    canvas.show();
    var img = new Image();
    img.onload = function() {
      context.drawImage(img, 0,0,parameters.photoWidth,parameters.photoHeight);
    }
    img.src= URL.createObjectURL(file);

  }

  function createHeader()
  {
    var modalHeader = $("<div>",{
      class:"modal-header"
    });
    
    modalHeader.append(
      $("<button>", {
        type:"button",
        class:"close",
        "data-dismiss":"modal",
        "aria-label": "Close"
      }).append(
        $("<span>",{
           "aria-hidden":"true",
          html:"&times;"
      }))).append(
        $("<h4>",{
            class:"modal-title",
            id:"upload-Image-label",
            text: "Upload Photo"
        }));
    return modalHeader;
  }

  function createFileSelect()
  {
    var fileSelect = $("<div>",{
      class: function () { if (canCapture() ) { return "col-md-6"; } else { return "col-md-12"}},
      id:"fileSelect"
    }).append(
      $("<input>",{
        style:"display: none",
        type:"file",
        name:"file",
        id:"file",
        size:"50"
      }).change(function(e) {
        fileSelectChanged(e)
      })
    ).append(
      $("<label>",{ 
        for:"file",
        html:'<i class="fa fa-picture-o" aria-hidden="true"></i><br/>Upload an existing Photo'
      })
    ).append(
      $("<p>", {
        text:"Max photo size: " + parameters.maxPhotoSize
      })
    );
    return fileSelect;
  }

  function createCameraSelect()
  {
    if ( canCapture () )
    {
      var cameraSelect = $("<div>",{
        class:"col-md-6",
        id:"cameraSelect"
      }).append(
        $("<label>",{ 
          id: "captureFromWebcam",
          html:'<i class="fa fa-video-camera" aria-hidden="true"></i><br>Capture from Webcam',
        }).click(function(){
          canvas.hide();
          $("#previewPane").empty().append(createCapturePreview());
          startVideo();
          $("#snap").click(function () {
            snapshotVideo();
          })
        })
      );
      return cameraSelect;
    }
    else
    {
      return null;
    }
  }

  function createCapturePreview() 
  {
    var capture = $("<div>",{
      class:"col-md-12",
      id:"photoCapture"
    }).append(
      $("<video>",{
        id:"video",
        width: parameters.photoWidth,
        height: parameters.photoHeight,
        autoplay:true
      })
    ).append(
      canvas
    ).append(
      $("<br>")
    ).append(
      $("<button>",{
        class:"btn btn-primary",
        type:"button",
        id:"snap",
        text:"Snap Photo"
      })
    ).append(
      $("<button>",{
        class:"btn btn-warning",
        type:"button",
        id:"retake",
        style:"display:none",
        text:"Re-Take Photo"
      }).click(function () {
        retakeSnapshot();
      })
     );
     return capture;
    
  }

  function createBody()
  {
     var modalBody = $("<div>",{
      class:"modal-body"
    });
    
    var container = $("<div>",{
      class:"container-fluid"
    }).append(
        $("<div>",{class:"row"}).append(
          createFileSelect()
        ).append(
          createCameraSelect()
        )
    ).append(
        $("<div>",{class:"row"}).append(
          $("<div>",{id:"previewPane"})
        )
    );
    
    return modalBody.append(container);
  }
  
  function createFooter()
  {
    var modalFooter = $("<div>",{
      class:"modal-footer"
    });
    
    modalFooter.append(
      $("<button>",{
        type:"button",
        class:"btn btn-default",
        "data-dismiss":"modal",
        text: "Close"
      })
    ).append(
      $("<input>",{
        id:"uploadImage",
        type:"submit",
        class:"btn btn-primary",
        "data-dismiss":"modal",
        text: "Upload Image",

      }).click(function (event) {
        parameters.uploadImage(event);
      })
    );
    
    return modalFooter;
  }
  
  function createModal()
  {
    var modal = $("<div>",{
      class: "modal fade",
      id: "upload-image",
      tabindex: "-1",
      role: "dialog",
      "aria-labelledby": "upload-Image-label",
      "aria-hidden":  "true"
    });
    
    var modalDialog = $("<div>",{
      id: "photoUploader-dialog",
      class: "modal-dialog modal-lg"
    });
    
    var uploadForm = $("<form>",{
      action:"#",
      method: "POST",
      enctype:"multipart/form-data",
      id:"UploadForm"
    });
    
    var modalContent = $("<div>",{
      class:"modal-content"
    });
    return modal.append(
      modalDialog.append(
      
        uploadForm.append(
          modalContent.append(
            createHeader()
          ).append(
            createBody()
          ).append(
            createFooter()
          )
        )        
      )
    );
  }
  
  function startVideo()
  {
    // Get access to the camera!
    var constraints = { 
      video: { 
        width: parameters.photoWidth, 
        height: parameters.photoHeight 
      } 
    };
    navigator.mediaDevices.getUserMedia(constraints)
      .then(function(userCameraStream) {
        $("#photoOr").show();
        $("#photoCapture").show();
        // Grab elements, create settings, etc.
        this.video = document.getElementById('video');
        this.stream = userCameraStream;
        this.video.src = window.URL.createObjectURL(userCameraStream);
        this.video.play();
      });
  }

  function stopVideo()
  {
    this.video.pause();
    this.video.src='';
    this.stream.getTracks()[0].stop();
  }

  function snapshotVideo()
  {
    context.drawImage(this.video,0,0,parameters.photoWidth,parameters.photoHeight);
    $(canvas).css("display","");
    $(this.video).css("display","none");
    $("#retake").show();
    $("#snap").hide();
  }
  
  function retakeSnapshot()
  {
    $("#retake").hide();
    $("#snap").show();
    $(canvas).css("display","none");
    $(this.video).css("display","");
  }
  
  

  function canCapture()
  {
    return navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.location.protocol == "https:"
  }

  $.fn.PhotoUploader.defaultParameters = {
    url: "/photo",
    maxPhotoSize: "2MB",
    photoHeight: 240,
    photoWidth: 320,
    uploadImage: function (event)
    {
      event.preventDefault();
      var dataURL = canvas.get(0).toDataURL();
      $.ajax({
        method: "POST",
        url: parameters.url,
        data: { 
          imgBase64: dataURL
        }
      }).done(function(o) {
        $("#upload-image").modal("hide");
        if (parameters.done){
          parameters.done(o);
        }
      });
    }
  }

})( jQuery );