$(document).ready(function () {
    $('.readmore').hide()
    $('#table').hide()
    $('#amount').hide()
    $.ajax({
        type: 'POST',
        url: '/viewing',
    })
        .done(function (data) {
            $('#loading').hide()
            $('.readmore').show()
            $('#amount').show()
            if (data.error) {
                
                Swal.fire({
                    icon: 'error',
                    text: data.error
                });

            } else {
                portfolio = data.port
                assets = data.ass
                stock_data = data.stock
                $('#table').show()
                sum = 0
                net = 0
                for (let i = 0; i < portfolio.length; i++) {
                    sum += portfolio[i][1]
                    net += parseInt(portfolio[i][1]) * parseInt(stock_data[i][1])
                    tmp = [portfolio[i][0], stock_data[i][0], stock_data[i][1], stock_data[i][2], stock_data[i][3], portfolio[i][1], portfolio[i][2], (portfolio[i][1] * stock_data[i][1]).toFixed(3), (portfolio[i][1] * stock_data[i][1] - portfolio[i][2]).toFixed(3)]
                    $('#body-table').append('<tr><td>' + tmp[0] + '</td><td>' + tmp[1] + '</td><td>' + tmp[2] + '</td><td>' + tmp[3] + '</td><td>' + tmp[4] + '</td><td>' + tmp[5] + '</td><td>' + tmp[6] + '</td><td>' + tmp[7] + '</td><td>' + tmp[8] + '</td>')
                }
                var total=parseInt(net)+parseInt(assets[0][0])
                $('#balance').text('Balance: ' + assets[0][0] + "$")
                $('#net').text('Net Worth: ' + total + "$")
                $('#comp').text('Companies Invested: ' + portfolio.length)
                $('#num').text('Number of stocks: ' + sum)


            }
        });

});

$('#buysell').click(function () {
    $(location).prop('href', 'viewing/buystocks')

})

$('#balance-btn').click(function () {
    if ($('#amount').val() != "" && $('#amount').val() >= 1) {
        $('#loading').show()
        $('.readmore').hide()
        $('#amount').hide()
        $.ajax({
            data: {
                amount: $('#amount').val()
            },
            type: 'POST',
            url: '/addbalance',
        })
            .done(function (data) {
                $('#loading').hide()
                $('#amount').show()
                $('.readmore').show()
                $('#amount').val('')
                if (data.error) {
                    Swal.fire({
                        icon: 'error',
                        text: data.error
                    });

                } else {
                    Swal.fire({
                        icon: 'success',
                        text: data.success
                    });
                    balance = data.balance
                    $('#balance').text('Balance: ' + balance + "$")


                }
            });
    } else {
        Swal.fire({
            icon: 'error',
            text: 'You have to enter a value to add to your balance that is greater or equal to 1!'
        });
    }
});
