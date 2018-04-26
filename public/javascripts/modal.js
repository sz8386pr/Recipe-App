// reference from https://www.w3schools.com/howto/howto_css_modals.asp and http://jsfiddle.net/limeric29/C3LkL/

// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var external_links = document.getElementsByClassName("external-link");

// Get the <span> element that closes the modal
var close = document.getElementById("close-button");

// Get the modal-body element
var modal_body = document.getElementById('modal-body');

// When the user clicks the button, open the modal
for (var i = 0; i < external_links.length; i++) {
	external_links[i].onclick = function(e) {
		e.preventDefault();
		var url = this.getAttribute('href');
		alert(url);
		modal_body.innerHTML = '<iframe width="100%" height="400px" frameborder="0" allowtransparency="true" src="'+url+'"></iframe>';
		modal.style.display = "block";
	};
}

// When the user clicks on <span> (x), close the modal
close.onclick = function() {
	modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}