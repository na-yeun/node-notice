document.addEventListener("DOMContentLoaded", function() {
	var notices = document.querySelectorAll('.notice');

	notices.forEach(e=>{
		e.addEventListener('click', function(e){
			let myTr = e.target.closest('tr');
			let myId = myTr.id;
			window.location.href = `/detail/${myId}`;
		})
	})

	var insertBtn = document.querySelector('#insertBtn');
	insertBtn.addEventListener('click', function(e){
		window.location.href = `/write`;
	})
	
})