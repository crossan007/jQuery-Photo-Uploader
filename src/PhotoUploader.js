(function( $ ) {
  
  var parameters ={};
  
  $.fn.PhotoUploader = function (userParameters) {
    
    parameters = $.extend( {}, $.fn.PhotoUploader.defaultParameters, userParameters );
    this.append(createModal());
    
    $("#upload-image").on("shown.bs.modal", function () {
      if (canCapture() )
      {
        
      }
    });

    $("#captureFromWebcam").click(function(){
      createCapturePreview();
      startVideo();
    });
  
    $("#upload-image").on("hidden.bs.modal", function() {
     stopVideo();
    });
    
    $("#snap").click(function () {
     snapshotVideo();
    });

    $("#retake").click(function () {
     retakeSnapshot();
    });

    $("#uploadImage").click(function (event) {
      uploadStaticImage();
    });

    $("#fileSelect input[name=file]").change(function() {
      fileSelectChanged(this)
    });
    
    this.show = function()
    {
      $("#upload-image").modal("show");
    }

    return this;
  }

  function fileSelectChanged(fileSelect)
  {
    console.log("Fileselect Changed");
    
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
      style:"text-align: center; border: solid 1px grey; background-color:#eeeeee; min-height:145px",
      id:"fileSelect"
    }).append(
      $("<input>",{
        style:"display: none",
        type:"file",
        name:"file",
        id:"file",
        size:"50"
      })
    ).append(
      $("<label>",{ 
        for:"file",
        html:'<i class="fa fa-picture-o" style="font-size:64pt" aria-hidden="true"></i><br/>Upload an existing Photo'
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
      style:"text-align: center; border: solid 1px grey; background-color:#eeeeee; min-height:145px",
      id:"cameraSelect"
    }).append(
      $("<label>",{ 
        id: "captureFromWebcam",
        html:'<i class="fa fa-video-camera" style="font-size:64pt" aria-hidden="true"></i><br>Capture from Webcam',
      })
    );

    return cameraSelect;
    }
    else
    {
      return null;
    }
  }

  function showCapture()
  {
    console.log("show capture");
  }
  
  function createCapturePreview() 
  {
    var capture = $("<div>",{
      style:"text-align: center",
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
      $("<canvas>",{
        id:"canvas",
        style:"display:none",
      })
        .attr("width", parameters.photoWidth)
        .attr("height", parameters.photoHeight)
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
      class: "modal-dialog"
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
  
  function startVideo(){
    // Get access to the camera!
    var constraints = { 
      video: { 
        width: parameters.photoWidth, 
        height: parameters.photoHeight 
      } 
    };
    navigator.mediaDevices.getUserMedia(constraints)
      .then(function(userCameraStream) {
        $("#photoUploader-dialog").addClass("modal-lg");
        $("#photoOr").show();
        $("#photoCapture").show();
        // Grab elements, create settings, etc.
        this.video = document.getElementById('video');
        this.stream = userCameraStream;
        this.canvas = document.getElementById('canvas');
        this.context = this.canvas.getContext('2d');
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
    this.context.drawImage(this.video,0,0,parameters.photoWidth,parameters.photoHeight);
    $(this.canvas).css("display","");
    $(this.video).css("display","none");
    $("#retake").show();
    $("#snap").hide();
  }
  
  function retakeSnapshot()
  {
    $("#retake").hide();
    $("#snap").show();
    $(this.canvas).css("display","none");
    $(this.video).css("display","");
  }
  
  function uploadStaticImage()
  {
    if ( ! $('input[type="file"]').val() )
      {
        event.preventDefault();
        var dataURL = this.canvas.toDataURL();
        $.ajax({
          method: "POST",
          url: parameters.url,
          data: { 
            imgBase64: dataURL
          }
        }).done(function(o) {
          location.reload();
          $("#upload-image").modal("hide");
        });
      }
  }

  function canCapture()
  {
    return navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.location.protocol == "https:"
  }

  $.fn.PhotoUploader.defaultParameters = {
    url: "/photo",
    maxPhotoSize: "2MB",
    photoHeight: 240,
    photoWidth: 320    
  }

})( jQuery );