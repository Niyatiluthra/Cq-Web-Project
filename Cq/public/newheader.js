function openLogoutPage()
  {
      console.log("idher agya");
    $.confirm({
      title: 'Confirm Logout!',
      content: 'Do you want to logout?',
      buttons: {
          Yes: {
            btnClass: 'btn-success',
            action: function(){
              window.location.replace("/logout");
            }
          },
          No: {
            btnClass: 'btn-danger'
          }
        },
      theme: 'supervan'
    });
  }
