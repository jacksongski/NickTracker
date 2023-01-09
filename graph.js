function getData(gym) {
  var ajaxRequest;

  try {
    ajaxRequest = new XMLHttpRequest();
  } catch (e) {
    alert("Your browser broke!");
    return false;
  }

  ajaxRequest.onreadystatechange = function () {
    if (ajaxRequest.readyState == 4) {
      resp = ajaxRequest.responseText;
      resp = JSON.parse(resp);
      currData = resp;
      const ctx = document.getElementById("myChart").getContext("2d");

      // init graph data
      labels = getLabels();
      graphData = [];
      graphSpecs = {
        // labels: resp.map((x) => x[0] + " " + x[1]),
        labels: labels,
        datasets: [
          {
            backgroundColor: "rgb(255, 81, 49, .3)",
            borderColor: "rgb(156, 0, 0)",
            pointBackgroundColor: "rgb(255, 60, 60)",
            pointRadius: 5,
            pointHoverRadius: 7,
            hoverBackgroundColor: "rgb(26, 35, 126)",
            fill: true,
            data: currData.map((x) => x[gym == "nick" ? 8 : 5]),
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
                  time = currData[index][1].split(":"); // get time of curr hover
                  if (time[0] >= 12) {
                    // convert to 12 hr time
                    time[1] += " p.m.";
                  } else {
                    time[1] += " a.m.";
                  }
                  time[0] = ((parseInt(time[0]) + 11) % 12) + 1 + ":";
                  date = new Date(currData[index][0].split("-"));
                  day = new Intl.DateTimeFormat("en-US", {
                    weekday: "long",
                  }).format(date);
                  return (
                    // return readable format
                    "Date: " +
                    currData[index][0] +
                    "\nDay: " +
                    day +
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

      chart = new Chart(ctx, config);

      const lastUpdated = document.getElementById("lastUpdated");
      lastUpdated.innerHTML =
        "Last updated on " +
        resp[resp.length - 1][0] +
        " at " +
        resp[resp.length - 1][1];
    }
  };

  if (gym == "nick") {
    ajaxRequest.open("GET", "getData.php" + "", true);
  } else {
    ajaxRequest.open("GET", "getShellData.php" + "", true);
  }
  ajaxRequest.send(null);
}

function getLabels() {
  dates = currData.map((x) => x[0]);
  labels = [];

  for (let i = 0; i < dates.length; i++) {
    if (i == 0 || dates[i] != dates[i - 1]) {
      labels.push(dates[i]);
    } else {
      labels.push("");
    }
  }
  return labels;
}

function btnFunc(id) {
  buttons = document.getElementsByTagName("button");
  for (button of buttons) {
    button.setAttribute("aria-pressed", "false");
  }
  curr = document.getElementById(id);
  curr.setAttribute("aria-pressed", "true");
  graphData = [];

  // index for resp based on btn label
  let j = 0;
  if (id == "nicktotal") {
    j = 8;
  } else if (id == "l1" || id == "weights") {
    j = 2;
  } else if (id == "l2" || id == "shelltrack") {
    j = 3;
  } else if (id == "l3" || id == "shellcardio") {
    j = 4;
  } else if (id == "ph" || id == "shelltotal") {
    j = 5;
  } else if (id == "track") {
    j = 6;
  } else if (id == "courts") {
    j = 7;
  }
  graphData = currData.map((x) => x[j]);

  graphSpecs.datasets[0].data = graphData;
  chart.update(config);
}

function timeChange(el) {
  if (el.value == "all") {
    currData = resp;
    chart.config._config.data.labels = getLabels();
    btnFunc(document.querySelector("[aria-pressed=true]").id);
  } else {
    currData = [];
    let i = resp.length - 1;
    temp = resp[i][0];
    while (resp[i][0] == temp) {
      currData.unshift(resp[i]);
      temp = resp[i][0];
      i--;
    }
    newLabels = currData.map((x) => x[1]);
    chart.config._config.data.labels = newLabels;
    btnFunc(document.querySelector("[aria-pressed=true]").id);
  }
}

async function gymChange(el) {
  if (el.value == "nick") {
    await chart.destroy();
    getData("nick");
    document.getElementById(
      "btnGroup"
    ).innerHTML = `<button id="l1" onclick="btnFunc('l1')">LEVEL 1</button>
    <button id="l2" onclick="btnFunc('l2')">LEVEL 2</button>
    <button id="l3" onclick="btnFunc('l3')">LEVEL 3</button>
    <button id="ph" onclick="btnFunc('ph')">POWER HOUSE</button>
    <button id="track" onclick="btnFunc('track')">TRACK</button>
    <button id="courts" onclick="btnFunc('courts')">COURTS</button>
    <button id="nicktotal" aria-pressed="true" onclick="btnFunc('total')">
      TOTAL
    </button>`;
    // chart.config._config.data.labels = getLabels();
    // btnFunc(document.querySelector("[aria-pressed=true]").id);
  } else {
    await chart.destroy();
    getData("shell");
    document.getElementById(
      "btnGroup"
    ).innerHTML = `<button id="weights" onclick="btnFunc('weights')">WEIGHTS</button>
    <button id="shelltrack" onclick="btnFunc('shelltrack')">TRACK</button>
    <button id="shellcardio" onclick="btnFunc('shellcardio')">CARDIO</button>
    <button id="shelltotal" aria-pressed="true" onclick="btnFunc('shelltotal')">TOTAL</button>
    `;
    // chart.config._config.data.labels = getLabels();
    // btnFunc(document.querySelector("[aria-pressed=true]").id);
  }
}

function helpPopup(popup) {
  el = document.getElementById("overlay");
  if (popup) {
    el.style.visibility = "visible";
  } else {
    el.style.visibility = "hidden";
  }
}

let config, chart;
resp = [["empty", "empty", 0, 0, 0, 0, 0, 0, 0]];
currData = resp;
getData("nick");
