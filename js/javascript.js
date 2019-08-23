const common = (function()
{
    "use strict";
    
    /////////////
    // Variables.
    /////////////
    
    // The array of navigation links. These will be modified when the subscription key information changes.
    
    const uriBasePreRegion = "https://";
    const uriBasePostRegion = ".api.cognitive.microsoft.com/vision/";
    const uriBaseAnalyze = "v1.0/analyze";
    const uriBaseLandmark = "v1.0/models/landmarks/analyze";
    const uriBaseCelebrities = "v1.0/models/celebrities/analyze";
    const uriBaseThumbnail = "v1.0/generateThumbnail";
    const uriBaseOcr = "v1.0/ocr";
    const uriBaseHandwriting = "v1.0/recognizeText";

    const subscriptionChange = () =>
    {
        // Build parameter string.
        const paramString = "?subscriptionKey=" + 
            encodeURIComponent(document.getElementById("subscriptionKeyInput").value) +
            "&subscriptionRegion=" + 
            encodeURIComponent(document.getElementById("subscriptionRegionSelect").value);
    };

    // Returns the value of the specified URL parameter.
    
    const getQueryVariable = (paramaterName) => 
    {
        // Get the URL parameters.
        const query = window.location.search.substring(1);
        // Split the parameters into a string array.
        var vars = query.split("&");
        // Parse the string array and return the value of the specified parameter.
        for (var i = 0; i < vars.length; ++i) 
        {
            var pair = vars[i].split("=");
            if (pair[0] === paramaterName)
            {
                // Return the value.
                return pair[1];
            }
        }   
        // If the parameter wasn't found, return false.
        return(false);
    }
    
    // Displays an error when an image does not load.
    
    const imageLoadError = () =>
    {
        $("#responseTextArea").val("Image load error.");
    }
    
    // Initializes the page.
    const init = () =>
    { 
        // Extract URL parameters into the subscription key elements.
        var subKey = getQueryVariable("subscriptionKey");
        if (subKey)
        {
            document.getElementById("subscriptionKeyInput").value = decodeURIComponent(subKey);
        }
        
        subKey = getQueryVariable("subscriptionRegion");
        if (subKey)
        {
            document.getElementById("subscriptionRegionSelect").value = decodeURIComponent(subKey);
        }
        
        subscriptionChange();
    };

    return {
        // Declare public members.
        init:                   init,
        getQueryVariable:       getQueryVariable,
        subscriptionChange:     subscriptionChange,
        imageLoadError:         imageLoadError,
        uriBasePreRegion:       uriBasePreRegion,
        uriBasePostRegion:      uriBasePostRegion,
        uriBaseAnalyze:         uriBaseAnalyze,
        uriBaseLandmark:        uriBaseLandmark,
        uriBaseCelebrities:     uriBaseCelebrities,
        uriBaseThumbnail:       uriBaseThumbnail,
        uriBaseOcr:             uriBaseOcr,
        uriBaseHandwriting:     uriBaseHandwriting
    };
})();


// Initialize the JavaScript code.

window.onload = common.init;

const analyzeButtonClick = () => {
    // Clear the display fields.
    $("#sourceImage").attr("src", "#");
    $("#captionSpan").text("");
    // Display the image.
    const sourceImageUrl = $("#inputImage").val();
    $("#sourceImage").attr("src", sourceImageUrl);
    AnalyzeImage(sourceImageUrl, $("#responseTextArea"), $("#captionSpan"));
}

const AnalyzeImage = (sourceImageUrl, responseTextArea, captionSpan) => {
    // Request parameters.
    var params = {
        "visualFeatures": "Categories,Description,Color",
        "details": "",
        "language": "en",
    };
    
    // Perform the REST API call.
    $.ajax({
        url: common.uriBasePreRegion + $("#subscriptionRegionSelect").val() + common.uriBasePostRegion + common.uriBaseAnalyze + "?" + $.param(params),             
        // Request headers.
        beforeSend: function(jqXHR){
            jqXHR.setRequestHeader("Content-Type","application/json");
            jqXHR.setRequestHeader("Ocp-Apim-Subscription-Key", 
                encodeURIComponent($("#subscriptionKeyInput").val()));
        },
        type: "POST",
        // Request body.
        data: '{"url": ' + '"' + sourceImageUrl + '"}',
    })
    
    .done(function(data) {
        // Show formatted JSON on webpage.

        for(var i = 0; i < data.description.tags["length"]; ++i ) {
            // responseTextArea.val(data.description.tags[i]);
            $("#responseTextArea1").append(`<ul><li>${data.description.tags[i]}</li></ul>`);
        }

        // Extract and display the caption and confidence from the first caption in the description object.
        if (data.description && data.description.captions) {
            var caption = data.description.captions[0];
            if (caption.text && caption.confidence) {
                captionSpan.text("Caption: " + caption.text +
                    " (confidence: " + caption.confidence + ").");
            }
        }
    })
    
    .fail(function(jqXHR, textStatus, errorThrown) {
        // Prepare the error string.
        var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
        errorString += (jqXHR.responseText === "") ? "" : (jQuery.parseJSON(jqXHR.responseText).message) ? 
        jQuery.parseJSON(jqXHR.responseText).message : jQuery.parseJSON(jqXHR.responseText).error.message;
        
        // Put the error JSON in the response textarea.
        responseTextArea.val(JSON.stringify(jqXHR, null, 2));
        
        // Show the error message.
        alert(`Sorry there was an error processing your request`);
        
        $("#responseTextArea").html(`<div><h3 class='error'>Check Your Entered Url Again</h3></div>`);
        
    });
}
