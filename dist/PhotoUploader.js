(function( $ ) {

  var parameters ={};
  var canvas = {};
  var context = {};
  var currentImage = {
    image:{},
    height:0,
    width:0,
    top:0,
    left:0,
    right:0,
    bottom:0,
  };

  var mouseEvents = {
    offsetX:0,
    offsetY:0,
    startX:0,
    startY:0,
    isDragging:0
  }

  $.fn.PhotoUploader = function (userParameters) {
    
    parameters = $.extend( {}, $.fn.PhotoUploader.defaultParameters, userParameters );
    canvas = $("<canvas>",{
      id:"canvas"
    })
    .attr("width", parameters.photoWidth)
    .attr("height", parameters.photoHeight)
    .mousedown(function(e){
      handleMouseDown(e);
    })
    .mousemove(function(e){
      handleMouseMove(e);
    })
    .mouseup(function(e){
      handleMouseUp(e);
    });

    canvasOffset = canvas.offset();
    mouseEvents.offsetX = canvasOffset.left;
    mouseEvents.offsetY = canvasOffset.top;

    context = canvas.get(0).getContext("2d");

    this.append(createModal());

    $("#upload-image").on("hidden.bs.modal", function() {
     stopVideo();
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
          $("#previewPane").hide();
          $("#capturePane").show();
          $("#retake").show();
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

  function createCapturePane()
  {
     var capture = $("<div>",{
      class:"col-md-12",
      id:"capturePane",
      style:"display:none; text-align: center"
    }).append(
      $("<video>",{
        id:"video",
        width: parameters.photoWidth,
        height: parameters.photoHeight,
        autoplay:true
      })
    ).append(
      $("<br>")
    ).append(
      $("<button>",{
        class:"btn btn-primary",
        type:"button",
        id:"snap",
        text:"Snap Photo"
      })
    );
     return capture;
  }

  function createPreviewPane() 
  {
    var capture = $("<div>",{
      class:"col-md-12",
      id:"previewPane",
      style:"display: none; text-align: center"
    }).append(
      canvas
    ).append(
      $("<br>")
    ).append(
      createEditControls()
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

  function createEditControls()
  {
    var editControls = $("<div>" ,{
      id:"editControls"
    });

    editControls.append(
      $("<button>",{
        class:"btn",
        type:"button",
        id:"shrink",
        text:"-"
      }).click(function (){
          shrinkImage();
        })
      
    ).append(
      $("<button>",{
        class:"btn",
        type:"button",
        id:"grow",
        text:"+"
      }).click(function (){
          growImage();
        })
    )

    return editControls;


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
          $("<div>",{id:"imageArea"}).append(createCapturePane()).append(createPreviewPane())
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

  function retakeSnapshot()
  {
    this.video.play();
    $("#previewPane").hide();
    $("#capturePane").show();
  }

  function snapshotVideo()
  {
    this.video.pause();
    currentImage.image= this.video;
    currentImage.width = this.video.videoWidth;
    currentImage.height = this.video.videoHeight;
    calcEdges();
    updateCanvas();
    $("#capturePane").hide();
    $("#previewPane").show();
  }

  function fileSelectChanged(fileSelect)
  {
    
    var file = fileSelect.target.files[0];
    fileSelect.target.files=null;
    if (!file.type.match('image.*')) {
      return;
    }

    $("#retake").hide();
    $("#previewPane").show();
    
    
    currentImage.image = new Image();
    currentImage.image.onload = function() {
      currentImage.height = currentImage.image.height;
      currentImage.width = currentImage.image.width;
      calcEdges();
      updateCanvas();
      canvas.show();
    }
    currentImage.image.src= URL.createObjectURL(file);

  }

  function calcEdges()
  {
   currentImage.right=currentImage.left+currentImage.width;
   currentImage.bottom=currentImage.top+currentImage.height;
   
  }

  function handleMouseUp (e)
  {
      mouseEvents.isDragging=0;
     
  }

  function handleMouseDown (e)
  {
    mouseEvents.isDragging=1;
    mouseEvents.startX = parseInt(e.clientX -  mouseEvents.offsetX);
    mouseEvents.startY = parseInt(e.clientY - mouseEvents.offsetY);
  }

  function handleMouseMove(e)
  {
    if ( mouseEvents.isDragging)
    {
      dX = parseInt(e.clientX) - mouseEvents.startX -  mouseEvents.offsetX;
      dY = parseInt(e.clientY) - mouseEvents.startY -  mouseEvents.offsetY;
      console.log("dX: " + dX+" dY: "+dY);
      currentImage.top += dY;
      currentImage.bottom += dY;
      currentImage.left += dX;
      currentImage.right += dX;
      mouseEvents.startX = parseInt(e.clientX);
      mouseEvents.startY = parseInt(e.clientY);
      updateCanvas();
    }
  }

  function shrinkImage()
  {
    currentImage.width *= .90;
    currentImage.height *= .90;
    calcEdges();
    updateCanvas();
  }

  function growImage()
  {
    currentImage.width *= 1.1;
    currentImage.height *= 1.1;
    calcEdges();
    updateCanvas();
  }
  
  function updateCanvas()
  {
    console.log(currentImage);
    context.clearRect(0, 0, parameters.photoWidth, parameters.photoHeight);
    context.drawImage(currentImage.image, currentImage.left, currentImage.top,currentImage.width,currentImage.height);
    context.beginPath();
    context.moveTo(currentImage.left, currentImage.top);
    context.lineTo(currentImage.right, currentImage.top);
    context.lineTo(currentImage.right, currentImage.bottom);
    context.lineTo(currentImage.left, currentImage.bottom);
    context.closePath();
    context.stroke();
    
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