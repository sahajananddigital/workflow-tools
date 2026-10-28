async function loadFonts() {
  // const font = new FontFace("baloo", "url(BalooBhai2-Medium.ttf)", {
  //   style: "normal",
  //   weight: "400",
  //   stretch: "condensed",
  // });
  
  const font = new FontFace("baloo", "url(NotoSerifGujarati-Bold.ttf)", {
    style: "normal",
    weight: "400",
    stretch: "condensed",
  });
  
  // wait for font to be loaded
  await font.load();
  // add font to document
  document.fonts.add(font);
  // enable font with CSS class
  document.body.classList.add("fonts-loaded");
}
loadFonts();

var APPSSCRIPT_URL = "https://script.google.com/macros/s/AKfycbyC6_eVjX82vHYVW_HJeWsJzIarwNvLK6KQBSUIKSggrGXPAIufn6hveKJgCxmWBgSA/exec";

function php_email_form_submit(thisForm, action, formData) {
  
  fetch(action, {
    method: 'POST',
    //body: JSON.stringify(Object.fromEntries(formData )),
    body: formData,
    //headers: {'Content-type': 'application/x-www-form-urlencoded'}
  }).then(response => response.json())
  .then(response => {
    if( response.ok ) {
      return response
    } else {
      throw new Error(`${response.status} ${response.statusText} ${response.url}`); 
    }
  })
  .then(data => {
    thisForm.querySelector('.loading').classList.remove('d-block');
    if (data.ok) {
      thisForm.querySelector('.sent-message').classList.add('d-block');
      thisForm.reset(); 
    } else {
      throw new Error(data ? data : 'Form submission failed and no error message returned from: ' + action); 
    }
  })
  .catch((error) => {
    
  });
}

jQuery(document).ready(function(){
  jQuery('#selfie_form').submit(function(e){
    e.preventDefault();
    var imgInput = $(this).find('input[name="profile_img"]');
    var textInput = $(this).find('input[name="name"]');
    var phoneInput = $(this).find('input[name="phone"]')

    // php_email_form_submit( this, APPSSCRIPT_URL, new FormData(this) );
    var imgEl = document.createElement('img');
    // if (imgInput.files && imgInput.files[0]) {
    //   const reader = new FileReader();
    //   reader.onload = (e) => {
    //     imgEl.src = e.target.result;
    //   }
    //   reader.readAsDataURL(imgInput.files[0]);
    //   $(this).html(imgEl)
    // }

    imgEl.src = ($(imgInput).val())
    if( ( ($(imgInput).val()).indexOf('nochange') ) < 0 ){
      // $(this).append(imgEl)
      mergeSelfie(imgEl.src, textInput.val(), phoneInput.val())
    } else {
      alert('Please Select Image');
      alert(($(imgInput).val()).indexOf('nochange'));
    }
  })
}
    );
// import mergeImages from 'merge-images';

function mergeSelfie(imgURL, textInput, phoneInput){
  // var imgEl = document.createElement('img');
  // // imgEl.src = ($(imgInput).val())
  // $('form').append(imgEl)

  var imageSrc = '';
  var aTag = document.createElement('a');
  $('form').append(aTag);
  aTag.download = "mobile.jpg";

  mergeImages([
    { src: 'bg.png', x: 0, y: 0 },
    { src: imgURL, x:240, y: 590 },
  ], {nameText: textInput, phoneText: phoneInput}).then(b64 => imageSrc = b64).then( b64 => {
    aTag.href = imageSrc;
    return b64;
  } ).then( b64 => {
    aTag.click();
    aTag.remove();  
  } );

  // mergeImages([
  //   { src: 'bg.png', x: 0, y: 0 },
  //   { src: imgURL, x: 1200, y: 2150 },
  // ], {nameText: textInput}).then(b64 => imageSrc = b64).then( b64 => {
  //   imgEl.src = imageSrc;
  //   return b64;
  // } );
}

