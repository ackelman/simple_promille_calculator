const R = 0.68
const Beta = 0.015
let weight = 65.0

let widmark = (a, x) => a / (R * weight) * 100 - 0.015 * x

let amountsConsumed = []

let decimalToHHMM = (millis) => {
  let hours = Math.floor(millis / 3600000)
  let minutes = Math.floor((millis / 3600000 - hours) * 60)
  return String(hours) + ' hours and ' + String(minutes) + ' minutes'
}

function addDrink() {
  let amount = document.getElementById('amount').value
  let percentage = document.getElementById('percentage').value
  let time = document.getElementById('time').value

  var dat = new Date, tim = time.split(/\:|\-/g);
  dat.setHours(tim[0]);
  dat.setMinutes(tim[1]);

  //TODO: if entering one drink at 23 and another at 00,
  // it thinks the drink at 23 is much later than the one at 00

  amountsConsumed.push({ amount: Number(amount), percentage: Number(percentage)/100.0, time: dat.valueOf() })
  reloadChart()

  document.getElementById('amount').value = ''
  document.getElementById('percentage').value = ''
  document.getElementById('time').value = ''

  let tbodyRef = document.getElementById('tbody')
  let newRow = tbodyRef.insertRow()
  let newCell = newRow.insertCell()
  newCell.appendChild(document.createTextNode(amount))
  newCell = newRow.insertCell()
  newCell.appendChild(document.createTextNode(percentage))
  newCell = newRow.insertCell()
  newCell.appendChild(document.createTextNode(time))

  newCell = newRow.insertCell()
  let removeButton = document.createElement('button')
  removeButton.innerHTML = 'Delete'
  removeButton.onclick = function() { tbodyRef.removeChild(newRow) }
  newCell.appendChild(removeButton)
}

function calcY(amountsConsumed, t) {
  let sum = 0
  for (let i = 0; i < amountsConsumed.length; i++) {
    if (amountsConsumed[i].time > t) continue
    let a = widmark(amountsConsumed[i].amount * amountsConsumed[i].percentage, (t - amountsConsumed[i].time) / (3600.0 * 1000))
    sum += a
  }
  return sum
}

let barChart
function reloadChart() {
  let ctx = document.getElementById('myChart')

  let x = [amountsConsumed.reduce((acc, e) => acc < e.time ? acc : e.time, 9999999999999)]
  let y = [calcY(amountsConsumed, x)]
  while (y[y.length-1] > 0) {
    x.push(x[x.length-1]+60000)
    y.push(calcY(amountsConsumed, x[x.length-1]))
  }

  let good_at = x[y.findIndex((val) => val < 0.02)]
  let good_after = good_at - x[0]

  x = x.map(e => new Date(e).toTimeString().split(' ')[0])

  let data = {
	labels: x,
    datasets: [{
        label: "Promille",
        function: function(x) { return x },
        borderColor: "rgba(255, 0, 0, 1)",
        data: y,
        fill: false
    }]
  }

  if (barChart) barChart.destroy()
  barChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
          scales: {
            y: {
                min: 0,
                max: Math.max(...y)
            }
          }
      }
  });

  let ga = document.getElementById('good_after')
  ga.innerText = "You should be sober enough to drive after " + decimalToHHMM(good_after) + ' at ' + new Date(good_at).toTimeString().split(' ')[0] + '.'
}
reloadChart()