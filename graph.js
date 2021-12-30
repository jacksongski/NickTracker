allData = [];
graphData = [];
config = null;
myChart = null;
jQuery.ajax({
  url: "https://raw.githubusercontent.com/jacksongski/NickTracker/main/NickData.csv",
  type: "get",
  dataType: "text",
  async: "false",
  success: function (data) {
    let lines = data.split("\n");
    let fields = [
      "date",
      "time",
      "l1",
      "l2",
      "l3",
      "ph",
      "track",
      "courts",
      "total",
    ];
    let json = [];

    for (let i = 0; i < lines.length; i++) {
      let current = lines[i].split(",");
      let doc = {};
      for (let j = 0; j < fields.length; j++) {
        doc[fields[j]] = current[j];
      }
      json.push(doc);
    }
    allData = json;
    graphData = [];
    for (i = 0; i < allData.length; i++) {
      graphData.push(parseInt(allData[i].total));
    }

    curr = document.getElementById("total");

    labels = [];
    date = "";
    for (i = 0; i < allData.length; i++) {
      if (i % 20 == 0) {
        labels.push(allData[i].date);
      } else {
        labels.push("");
      }
    }
    graphSpecs = {
      labels: labels,
      datasets: [
        {
          backgroundColor: "rgb(255, 81, 49, .3)",
          borderColor: "rgb(156, 0, 0)",
          pointBackgroundColor: "rgb(214, 0, 0)",
          hoverBackgroundColor: "rgb(26, 35, 126)",
          fill: true,
          data: graphData,
        },
      ],
    };

    config = {
      type: "line",
      data: graphSpecs,
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          tooltip: {
            displayColors: false,
            backgroundColor: "rgba(20, 40, 50, 0.8)",
            titleFont: {
              weight: "normal",
            },
            bodyAlign: "center",
            bodyFont: {
              weight: "bold",
            },
            callbacks: {
              title: function (context) {
                index = context[0].dataIndex;
                time = allData[index].time.split(":");
                if (time[0] >= 12) {
                  time[1] += " p.m.";
                } else {
                  time[1] += " a.m.";
                }
                time[0] = ((parseInt(time[0]) + 11) % 12) + 1 + ":";
                return (
                  "Date: " +
                  allData[index].date +
                  "\nTime: " +
                  time[0] +
                  time[1]
                );
              },
            },
          },
          legend: {
            display: false,
          },
        },
      },
    };
    myChart = new Chart(document.getElementById("myChart"), config);
    console.log(allData[allData.length - 2].time);
    recentTime = allData[allData.length - 2].time.split(":");
    if (recentTime[0] >= 12) {
      recentTime[1] += " p.m.";
    } else {
      recentTime[1] += " a.m.";
    }
    recentTime[0] = ((parseInt(recentTime[0]) + 11) % 12) + 1 + ":";
    document.getElementById("lastUpdated").innerHTML +=
      " " +
      allData[allData.length - 2].date +
      " at " +
      recentTime[0] +
      recentTime[1];
  },
  error: function (jqXHR, textStatus, errorThrow) {
    console.log(textStatus);
  },
});

function btnFunc(id) {
  buttons = document.getElementsByTagName("button");
  for (button of buttons) {
    button.setAttribute("aria-pressed", "false");
  }
  curr = document.getElementById(id);
  curr.setAttribute("aria-pressed", "true");
  graphData = [];
  for (i = 0; i < allData.length; i++) {
    if (id == "total") {
      graphData.push(parseInt(allData[i].total));
    } else if (id == "l1") {
      graphData.push(allData[i].l1);
    } else if (id == "l2") {
      graphData.push(allData[i].l2);
    } else if (id == "l3") {
      graphData.push(allData[i].l3);
    } else if (id == "ph") {
      graphData.push(parseInt(allData[i].ph));
    } else if (id == "track") {
      graphData.push(parseInt(allData[i].track));
    } else if (id == "courts") {
      graphData.push(allData[i].courts);
    }
  }

  graphSpecs.datasets[0].data = graphData;
  myChart.update(config);
}
