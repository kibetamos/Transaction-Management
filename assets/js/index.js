$("#get_portfolio").submit(function(event){
  event.preventDefault();
  $(':input[type="submit"]').prop('disabled', true);
  $('#portfolio_table').hide();
  $('#spinner_container').show();
  var unindexed_array = $(this).serializeArray();
  var data = {}
  $.map(unindexed_array, function(n, i){
    data[n['name']] = n['value'];
  })
  var request = {
    "url" : `http://localhost:3000/api/get/portfolios`,
    "method" : "POST",
    "data" : data
  }
  $.ajax(request).done(function(response){
    $("#portfolio_table_body tr").remove();
    if(response.length > 0){
      for(var i = 0; i < response.length; i++){
        var tr_html = "<tr><td>" + (i + 1) + "</td><td>" + response[i].token + "</td><td>" + response[i].amount + "</td><td>" + response[i].price + " $</td></tr>";
        $("#portfolio_table_body").append(tr_html);
      }
    } else {
      var tr_html = "<tr><td colspan='4'>Transaction history not found.</tr>";
      $("#portfolio_table_body").append(tr_html);
    }
    $('#spinner_container').hide();
    $('#portfolio_table').show();
    $(':input[type="submit"]').prop('disabled', false);
  });
});