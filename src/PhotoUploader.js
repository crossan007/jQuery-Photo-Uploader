(function( $ ) {
  
  var parameters ={};
  
  $.fn.PhotoUploader = function (userParameters) {
    
    parameters = $.extend( {}, $.fn.PhotoUploader.defaultParameters, userParameters );
    this.append(createModal());
    
    $("#upload-image").on("shown.bs.modal", function () {
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
    
    this.show = function()
    {
      $("#upload-image").modal("show");
    }

    return this;
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
    var photoSelect = $("<div>",{
      class:"col-md-12",
      style:"text-align: center",
      id:"photoSelect"
    }).append(
      $("<p>", {
        text:"Upload an existing Photo"
      })
    ).append(
      $("<input>",{
        style:"margin: 0 auto",
        type:"file",
        name:"file",
        size:"50"
      })
    ).append(
      $("<p>", {
        text:"Max photo size: " + parameters.maxPhotoSize
      })
    );
    return photoSelect;
}
  
  function createCapture()
  {
    var capture = $("<div>",{
      style:"display:none; text-align: center",
      class:"col-md-12",
      id:"photoCapture"
    }).append(
      $("<p>",{
        text:"Capture a new Image"
      }) 
    ).append(
      $("<br>")
    ).append(
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
        )
    ).append(
      $("<div>",{class:"row"}).append(
        $("<div>",{
          style:"display:none; text-align: center;",
          class:"col-md-12",
          id:"photoOr"
        }).append($("<p>",{
          text:"~OR~"
        }))
      )
    ).append(
     $("<div>",{class:"row"}).append(
        createCapture()
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
    if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
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

  $.fn.PhotoUploader.defaultParameters = {
    url: "/photo",
    maxPhotoSize: "2MB",
    photoHeight: 480,
    photoWidth: 640    
  }

})( jQuery );