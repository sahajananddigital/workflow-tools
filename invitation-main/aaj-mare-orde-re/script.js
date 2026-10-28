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

jQuery(document).ready(function(){
  jQuery('#selfie_form').submit(function(e){
    e.preventDefault();
    const formData = new FormData(this);

    mergeSelfie( formData )
  })
}
    );
// import mergeImages from 'merge-images';

function mergeSelfie( formData ){
  var imageSrc = '';
  var aTag = document.createElement('a');
  $('form').append(aTag);
  aTag.download = "mobile.jpg";

  mergeImages([
    { src: 'bg.png', x: 0, y: 0 },
  ], { formData: formData }).then(b64 => imageSrc = b64).then( b64 => {
    aTag.href = imageSrc;
    return b64;
  } ).then( b64 => {
    aTag.click();
    aTag.remove();  
  } );
}

