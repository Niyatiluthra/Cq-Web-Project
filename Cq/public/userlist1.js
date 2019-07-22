$(document).ready(function() {
  $('#users-table').DataTable(
    {
      "processing": true,
        "serverSide": true,
        "ajax": {
          "url" : "/usernl",
          "type" : "POST",
          "dataType" : "json",
        },
        "columns":[
          {
            "data" : "username"
          },
          {
            "data" : "phone"
          },
          {
            "data" : "city"
          },
          {
            "data" : "status"
          },
          {
            "data" : "role"
          },
          {
            "data" : "null"
          },
        ]
    }
  );
})
