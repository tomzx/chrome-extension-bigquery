chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval);

			attach();
		}
	}, 10);
});

const attach = function() {
	console.log("Attaching to run button and query validation status...")
	const runButton = document.querySelector(".bqui-test-run-query");
	const queryValidationStatus = document.querySelector("query-validation-status");
	console.log(queryValidationStatus);
	const callback = function(changes) {
		const text = queryValidationStatus.textContent
		console.log(text);
		const regex = /This query will process (?<number>\d\S*) (?<unit>\S+)/;
		const match = regex.exec(text);

		if (!match) {
			return;
		}

		console.log(match.groups);
		const unitToExponent = ["B", "KiB", "MiB", "GiB", "TiB"];
		const numberOfBytes =  match.groups.number * Math.pow(1024, unitToExponent.indexOf(match.groups.unit))
		console.log("# of bytes: " + numberOfBytes);
		const estimatedCost = Math.round(5.00 * numberOfBytes / Math.pow(1024, 4)*100)/100;
		console.log("Estimated cost: " + estimatedCost + " $ USD");

		runButton.textContent = "Run @ " + estimatedCost + " $ USD";
		runButton.disabled = false;
		if (estimatedCost >= 5) {
			runButton.style.backgroundColor = "#da7373";
			runButton.disabled = true;
		} else if (estimatedCost >= 2) {
			runButton.style.backgroundColor = "#e6ea02";
		} else {
			runButton.style.backgroundColor = "#3367d6";
		}
	};

	const mutationObserver = new MutationObserver(callback);
	mutationObserver.observe(queryValidationStatus, {childList: true, subtree: true});

	runButton.onclick = function() {
		mutationObserver.disconnect();
		const checkReadyToAttachInterval = setInterval(function() {
			console.log("Waiting for query to complete to attach to DOM...");
			const queryValidationStatus = document.querySelector("query-validation-status");
			if (!queryValidationStatus) {
				return;
			}
			clearInterval(checkReadyToAttachInterval)
			attach();
		}, 1000);
	}
};
