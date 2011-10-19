function showSettings() {
    hideOverlayDivs();
    hideContent();
    $('#settings').show();
    setActiveState();                                   
}

function hideSettings() {
    hideOverlayDivs();
    showContent();
}