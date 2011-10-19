function showSettings() {
    disableOptionsMenu();
    hideOverlayDivs();
    hideContent();
    $('#settings').show();
    setActiveState();                                   
}

function hideSettings() {
    enableOptionsMenu();
    hideOverlayDivs();
    showContent();
}