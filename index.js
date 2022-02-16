let checked = 0;
let interval;
let options;
let liveReportsNames = []

$(function () {
    $(".progress").hide()

    $("#home-button").on("click", function () {
        clearInterval(interval)
        $(".progress").toggle("slow")
        checked = 0;
        liveReportsNames = []

        $.ajax({
            url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd",
            timeout: '10000000',
            cache: true,
            success: data => {
                loadcoins(data)
            }
        })
    })

    const loadcoins = async function (data) {

        let cardsData = await data
        $("#coins-container").empty()
        $("#graphContainer").empty()
        clearInterval(interval)

        let cards = ""
        for (let i = 0; i < 50; i++) {
            const element = cardsData[i];

            cards += `
            <div class="card coin-card text-black bg-light mb-3" style="max-width: 18rem;">
                <div class="card-header">${element.symbol}
                    <div class="form-check form-switch">
                        <input class="form-check-input" name=${element.symbol} type="checkbox" role="switch" id="flexSwitchCheckDefault">
                    </div>
                </div>
                    <div class="card-body">
                    <div id="${element.id}" class="card-text">
                    <h6 class="card-title">${element.name}</h6>
                            <button class="show-more-button btn btn-outline-success">show more</button>
                            <div class="show-more-info"></div>
                            <button class="show-less-button btn btn-outline-success">show less</button>
                        </div>
                    </div>
            </div>
            `
        }

        $("#coins-container").append(cards)

        $(".show-more-info").hide() 
        $(".show-less-button").hide()
        $(".progress").hide()
    }
    
    const showMoreInfo = function (data, element, id) {
        element.empty()
        localStorage.setItem(`${id}`, JSON.stringify(data))

        let moreInfo = ""
        moreInfo += `
            <div id="more-info">
            <div id="coin-price">
            <p>${data.market_data.current_price.usd}$</p>
            <p>${data.market_data.current_price.eur}€</p>
            <p>${data.market_data.current_price.ils}₪</p><br />
            <img id="coin-image" src="${data.image.small}" alt="none">
            </div>
            </div>
        `
        element.append(moreInfo)
        element.toggle("slow")
        element.parent().children("button").toggle("fast")
    }
    
    
    $(document).on("click", ".show-more-button", function () {
        let id = $(this).parent().attr("id")
        let coin = JSON.parse(localStorage.getItem(`${id}`))

        if (coin === null) {
            $.ajax({
                url: `https://api.coingecko.com/api/v3/coins/${id}`, 
                success: data => {
                    console.log("api data")
                    showMoreInfo(data, $(this).parent().children("div"), id)
                }
            })
        }
        else {
            console.log("from-localstorage")
            showMoreInfo(coin, $(this).parent().children("div"), id)
        }
    })
     
    $("#show-live-reports-button").on("click", function () {

        checked = 0;
        $("#graphContainer").empty()
        clearInterval(interval)
        liveReportsNames = []

        let liveReportsNamesList = liveReportsCoins()
        if (liveReportsNamesList.length > 0) { 

            initLiveChart(liveReportsNamesList)
            $.ajax({
                url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${liveReportsNamesList}&tsyms=USD`,
                cache: true,
                success: data => {
                    loadLiveReports(data)
                }
            })
            interval = setInterval(function () {
                $.ajax({
                    url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${liveReportsNamesList}&tsyms=USD`,
                    cache: true,
                    success: data => {
                        loadLiveReports(data)
                    }
                })
            }, 2000)
        }
        else {
            alert("please select coins ")
        }
    })
    $("#about-button").on("click", function () {
        $("#graphContainer").empty()
        clearInterval(interval)
        $("#coins-container").empty()

        checked = 0;
        liveReportsNames = []

        let about = `
            
        <div class="col">
          <div class="card About-card p-3 shadow">
            <div class="card-body">
                <h1 class="card-title">About the project:</h1>
                <p class="card-text">
                Author: Neri Lichi <br>
                Date: 12/02/2022 <br><br>
                A singel page website made with jQuery, technolegys used:  <br><br>

                <h6>HTML + CSS:</h6><br><br />
                * New HTML5 tags<br>
                * CSS3 media queries and advanced selectors<br>
                * Dynamic page layouts<br>
                * Bootstrap & flex<br><br>

                <h6>JavaScript:</h6><br>
                * Objects<br>
                * Callbacks, Promises, Async Await<br>
                * jQuery<br>
                * Single Page Application foundations<br>
                * Events<br>
                * Ajax (Http calls)<br>
                * Documentation<br>
                External APIs<br><br>
                </p>
            </div>
          </div>
        </div>
        `
        $("#coins-container").append(about)
    })
    $(document).on("click", ".show-less-button", function () {
        $(this).parent().children("div").toggle("slow")
        $(this).parent().children("button").toggle("fast")
    })
    
    $("#searchInput").on("keyup", function () {
        let value = $(this).val().toLowerCase();
        $(".card").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
    });
    
    const initLiveChart = function (names) {
        $("#coins-container").empty()

        options = {
            animationEnabled: true,
            theme: "light2",
            title: {
                text: "Live Coin Details"
            },
            axisX: {
                title: "currnet Time",
                valueFormatString: "HH:mm:ss"
            },
            axisY: {
                title: "Value",
                suffix: "$"
            },
            toolTip: {
                shared: true
            },
            legend: {
                cursor: "pointer",
                verticalAlign: "bottom",
                horizontalAlign: "left",
                dockInsidePlotArea: true,
                itemclick: toogleDataSeries
            },
            data: [{
                type: "line",
                showInLegend: true,
                name: names[0],
                markerType: "square",
                xValueFormatString: 'HH:mm:ss',
                color: "black",
                yValueFormatString: "#,##0K",
                dataPoints: [
                ]
            },
            {
                type: "line",
                showInLegend: true,
                name: names[1],
                markerType: "square",
                xValueFormatString: 'HH:mm:ss',
                color: "green",
                yValueFormatString: "#,##0K",
                dataPoints: [
                ]
            }, {
                type: "line",
                showInLegend: true,
                name: names[2],
                markerType: "square",
                xValueFormatString: 'HH:mm:ss',
                color: "red",
                yValueFormatString: "#,##0K",
                dataPoints: [
                ]
            }, {
                type: "line",
                showInLegend: true,
                name: names[3],
                markerType: "square",
                xValueFormatString: 'HH:mm:ss',
                color: "yellow",
                yValueFormatString: "#,##0K",
                dataPoints: [
                ]
            }, {
                type: "line",
                showInLegend: true,
                name: names[4],
                markerType: "square",
                xValueFormatString: 'HH:mm:ss',
                color: "blue",
                yValueFormatString: "#,##0K",
                dataPoints: [
                ]
            },
            ]
        };
        $("#graphContainer").CanvasJSChart(options);

        function toogleDataSeries(e) {
            if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
                e.dataSeries.visible = false;
            } else {
                e.dataSeries.visible = true;
            }
            e.chart.render();
        }
        $(".progress").hide()
    }
    const loadLiveReports = function (data) {
        let values = []
        Object.entries(data).forEach(element => {
            if (!!element) {
                values.push(Object.entries(element[1])[0][1])
            }
        })
        let i = 0;
        values.forEach(() => {
            options.data[i].dataPoints.push({ x: new Date(), y: values[i] })
            i++
        })
        $("#graphContainer").CanvasJSChart(options);
    }
    const liveReportsCoins = () => {
        $(".form-check-input:checkbox:checked").each(function () {
            liveReportsNames.push($(this)[0].name)
        })
        return liveReportsNames
    }
    
    $(document).on("click", ".form-check-input:checkbox:checked", function () {
        checked++

        if (checked == 6) {
            asignModal()
            $('#exampleModal').modal("show")
        }

        if (checked > 6) { 
            checked--
            $(this).prop('checked', false)
            $('#exampleModal').modal("show")
        }
    })
    $(document).on("click", ".form-check-input:checkbox:not(:checked)", function () {
        checked--;

        const cardsForUncheck = $(`input[name="${$(this).attr('name')}"]`);
        cardsForUncheck.prop('checked', false);

        $(".modal-body").html("")
    })
    
    setInterval(function () {
        localStorage.clear();
    }, 120000)
    
    const asignModal = function () {
        $(".modal-body").html("")
        
        $(".form-check-input:checkbox:checked").each(function () {
            $(".modal-body").append($(this).parent().parent().clone().attr("aria-label", "Close").attr("data-bs-dismiss", "modal"))
            
        })
    }
})