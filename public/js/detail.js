document.addEventListener("DOMContentLoaded", function() {
    var editBtn = document.querySelector('#editBtn');
    var deleteBtn = document.querySelector('#deleteBtn');
    var returnBtn = document.querySelector('#returnBtn');
    

    const myTable = document.querySelector('#my-table');

    const myId = myTable.dataset.id;

    editBtn.addEventListener('click', function() {
        window.location.href = `/update/${myId}`;
    });

    deleteBtn.addEventListener('click', function() {
        let real = confirm(`삭제한 게시글은 되돌릴 수 없습니다. 정말로 삭제하시겠습니까?`);
        if(real){
            window.location.href = `/delete/${myId}`;
        } else {
            return;
        }
    });
	
    returnBtn.addEventListener('click', function() {
        window.location.href = `/`;
    })
})