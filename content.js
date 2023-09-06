// document.body.innerHTML = location.href;

chrome.storage.local.get('userClickedDetail', function (result) {
    document.getElementsByClassName("setting-input")[1].value = result.userClickedDetail.sshKey;
    document.getElementsByClassName("setting-input")[2].value = result.userClickedDetail.email;
});