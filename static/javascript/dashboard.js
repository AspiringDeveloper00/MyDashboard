$('#submit').click(function () {
    if ($('#stock').val() == "" || $('#stock').val() == null) {
        Swal.fire({
            icon: 'error',
            text: 'Please enter a stock symbol, for example AAPL for Apple.'
        });
    } else {
        $('#data-search').hide();
        $('#loading').show();
        $('.overview').css('display', 'none')
        $('#search-bar').hide();
        call();
    }
});




$("#stock").keyup(function (e) {
    if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
        if ($('#stock').val() == "" || $('#stock').val() == null) {
            Swal.fire({
                icon: 'error',
                text: 'Please enter a stock symbol, for example AAPL for Apple.'
            });
        } else {
            $('#data-search').hide();
            $('#loading').show();
            $('.overview').css('display', 'none')
            $('#search-bar').hide();
            call();
        }
    }
 });


$(document).ready(function () {
    $('#data-search').hide();
    $('#search-bar').hide();
    $.ajax({
        type: 'POST',
        url: '/dashboard',
    })
        .done(function (data) {
            if (data.error) {
                Swal.fire({
                    icon: 'error',
                    text: data.error
                });

            } else {
                stocks = data.stocks
                $('#loading').hide()
                $('#search-bar').show();

                autocomplete(document.getElementById("stock"), stocks);



            }
        });
});
function call() {
    $.ajax({
        data: {
            stock: $('#stock').val()
        },
        type: 'POST',
        url: '/callback',
    })
        .done(function (data) {
            $('#stock').val('')
            $('#data-search').show();
            if (data.error) {
                Swal.fire({
                    icon: 'error',
                    text: data.error
                });
                $('#loading').hide();
                $('#search-bar').show();

            } else {
                $("#container").empty();
                $('#loading').hide();
                $('#search-bar').show();
                // Stock chart
                var name = data.stock
                $('#tech-indicators').click(function(){
                    $(location).prop('href', 'technical-indicators/'+name)
                
                })
                var overview = data.overview
                var dataTable = anychart.data.table();
                var total_results = data.total_results
                var articles = data.articles
                dataTable.addData(data.stocks);
                var mapping = dataTable.mapAs({
                    open: 1,
                    high: 2,
                    low: 3,
                    close: 4,
                    volume: 5
                });
                var chart = anychart.stock();
                var plot = chart.plot(0);
                plot.yGrid(true).xGrid(true).yMinorGrid(true).xMinorGrid(true);
                var series = plot.candlestick(mapping)
                    .name(data.stock);
                series.legendItem().iconType('rising-falling');
                chart.scroller().candlestick(mapping);
                chart.selectRange(String(data.stocks[data.stocks.length - 1][0]), String(data.stocks[0][0]));
                var rangePicker = anychart.ui.rangePicker();
                rangePicker.render(chart);
                var rangeSelector = anychart.ui.rangeSelector();
                rangeSelector.render(chart);
                chart.title("Stock prices for: " + name);
                chart.container('container');
                var background = chart.background();
                background.stroke("4");
                background.cornerType("round");
                background.corners(20);
                background.fill('#0d0d11')
                chart.draw();



                $('.overview').css('display', 'block')
                // Bar chart
                chart = anychart.bar();
                var data_table = [
                    data.income_statement[0],
                    data.income_statement[1],
                    data.income_statement[2],
                    data.income_statement[3],
                    data.income_statement[4]
                ];
                var dataSet = anychart.data.set(data_table);
                var mapping1 = dataSet.mapAs({ x: 0, value: 1 });
                var mapping2 = dataSet.mapAs({ x: 0, value: 2 });
                var mapping3 = dataSet.mapAs({ x: 0, value: 3 });
                var mapping4 = dataSet.mapAs({ x: 0, value: 4 });
                var mapping5 = dataSet.mapAs({ x: 0, value: 5 });
                var chart = anychart.column();
                var series1 = chart.column(mapping1).name('Total Revenue');
                var series2 = chart.column(mapping2).name('Gross Profit');
                var series3 = chart.column(mapping3).name('Operating Expenses');
                var series4 = chart.column(mapping4).name('Income before Tax');
                var series5 = chart.column(mapping5).name('Net Income');
                chart.container("container2");
                chart.title("Stock income statement for: " + name);
                var background = chart.background();
                background.stroke("4");
                background.cornerType("round");
                background.corners(20);
                background.fill('#0d0d11')
                chart.draw();


                $('#Symbol').text(overview[0]);
                $('#AssetType').text(overview[1]);
                $('#Name').text(overview[2]);
                $('#Description').text(overview[3]);
                $('#Exchange').text(overview[4]);
                $('#Currency').text(overview[5]);
                $('#Country').text(overview[6]);
                $('#Sector').text(overview[7]);
                $('#Industry').text(overview[8]);
                $('#Address').text(overview[9]);

                for (let i = 0; i <= total_results; i++) {
                    if (articles.length > 0) {
                        if (articles[i][5] == "Unknown") { articles[i][5] = '../static/images/oops.jpg' }
                        $('.content').append("<div class=\"row\"><article><img src=" + articles[i][5] + " class=\"fixed\"><div class=\"post\"><h2>" + articles[i][2] + "</h2><div class=\"header\"><address><u>Source: " + articles[i][0] + "</u></address><br><address><u>Author: " + articles[i][1] + "</u></address><br><span class=\"blogdate\">Date: " + articles[i][6] + "</span></div><section class=\"description\"><u>Description:</u><p>" + articles[i][3] + "</p></section><section class=\"contents\"><u>Contents:</u><p>" + articles[i][7] + "</p></section><span class=\"blogdate\">Read full article <a href=\"" + articles[i][4] + "\" target=\"_blank\">here</a>.</span></div></article></div>")
                    }
                }


            }
        });

}





function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}
