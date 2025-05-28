import { h, Fragment } from "preact";
import { useState, useEffect } from "preact/hooks";
import { plansData, formatter } from "../plansData";

import Slider from "../components/Slider";

const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [seats, setSeats] = useState(1);

  // Auto-update tier based on seat count
  useEffect(() => {
    if (seats >= plansData.scale.minSeats) {
      setSelectedPlan("scale");
    } else if (seats >= plansData.team.minSeats) {
      setSelectedPlan("team");
    } else {
      setSelectedPlan("pro");
    }
  }, [seats]);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    // Ensure seat count meets minimum for the selected plan
    const minSeats = plansData[plan].minSeats;
    if (seats < minSeats) {
      setSeats(minSeats);
    }
  };

  const handleSeatChange = (newSeats) => {
    setSeats(Number(newSeats));
  };

  const calculateTotalPrice = () => {
    const plan = plansData[selectedPlan];
    return plan.pricePerEditor * seats;
  };

  // Check if a feature is included in the selected plan
  const isPlanFeatureIncluded = (feature) => {
    const requiredPlan = plansData.additionalFeatures[feature];

    // Check if the current plan meets or exceeds the required plan level
    if (requiredPlan === "pro") {
      return true; // All plans include pro features
    } else if (requiredPlan === "team") {
      return selectedPlan === "team" || selectedPlan === "scale";
    } else if (requiredPlan === "scale") {
      return selectedPlan === "scale";
    }

    return false;
  };

  // Generate the specific features section based on additionalFeatures
  const renderAdditionalFeatures = () => {
    return Object.entries(plansData.additionalFeatures).map(
      ([feature, requiredPlan]) => (
        <span
          key={feature}
          className={`py-2 px-4 ${
            isPlanFeatureIncluded(feature)
              ? "font-mono bg-count-purple-150 text-count-blue"
              : "font-mono border-1 border-gray-100 text-gray-400"
          } rounded-full text-sm`}
        >
          {feature}{" "}
          <span className="ml-1 text-xs bg-[color:var(--color-count-grey)] px-2 py-0.5 rounded capitalize">
            {requiredPlan}
          </span>
        </span>
      ),
    );
  };

  // Calculate the best upgrade recommendation
  const getUpgradeRecommendation = () => {
    // Current total cost
    const currentPlanPrice = plansData[selectedPlan].pricePerEditor;
    const currentCost = currentPlanPrice * seats;

    let bestPlan = null;
    let bestSeats = 0;
    let extra = 0;
    let editors = 0;
    let collaborators = 0;
    let savings = 0;

    // Check if upgrading to team plan makes sense
    if (selectedPlan === "pro" && seats < plansData.team.minSeats) {
      const teamMinSeats = plansData.team.minSeats;
      const seatsNeeded = teamMinSeats - seats;

      // Cost if upgrading to team plan
      const teamCost = plansData.team.pricePerEditor * teamMinSeats;

      bestPlan = "team";
      bestSeats = teamMinSeats;
      editors = seatsNeeded;
      collaborators =
        plansData.team.collaborators - plansData.pro.collaborators;
      extra = teamCost - currentCost;
    }

    // Check if upgrading to scale plan makes sense
    if (selectedPlan === "team" && seats < plansData.scale.minSeats) {
      const scaleMinSeats = plansData.scale.minSeats;
      const seatsNeeded = scaleMinSeats - seats;

      // Cost if staying with current plan and adding seats at same rate
      const costIfStayingWithCurrentPlan =
        currentCost + seatsNeeded * currentPlanPrice;

      // Cost if upgrading to scale plan
      const scaleCost = plansData.scale.pricePerEditor * scaleMinSeats;

      // Only recommend if it's significantly better than current recommendation
      if (
        scaleCost < costIfStayingWithCurrentPlan &&
        (!bestPlan || costIfStayingWithCurrentPlan - scaleCost > savings)
      ) {
        bestPlan = "scale";
        bestSeats = scaleMinSeats;
        editors = seatsNeeded;
        collaborators =
          plansData.scale.collaborators - plansData.team.collaborators;
        extra = scaleCost - currentCost;
      }
    }

    // Only show recommendation if there's a meaningful saving
    if (bestPlan && extra < 350) {
      return {
        plan: bestPlan,
        editors: editors,
        collaborators: collaborators,
        extra: Math.round(extra), // Round to nearest dollar for cleaner display
      };
    }

    return null;
  };

  const duckDbMessage = () => {
    if (plansData[selectedPlan].hasOwnProperty("duckDb")) {
      return (
        <p className="text-count-black mb-4 text-md font-sans lg:w-2/3">
          Count shifts <span className="text-count-blue">~80% of queries</span>{" "}
          to the user's browser for a snappier experience.
          <br />
          The additional{" "}
          <span className="text-count-blue">
            {plansData[selectedPlan].duckDb.capacity} DuckDB Server Query Cache
          </span>{" "}
          runs larger queries in our server environment, reducing data-warehouse
          load and costs{" "}
          <span className="text-count-blue">
            {plansData[selectedPlan].duckDb.saving}
          </span>
          .
        </p>
      );
    } else {
      return (
        <p className="text-count-black mb-4 text-md font-sans lg:w-2/3">
          Count shifts <span className="text-count-blue">~80% of queries</span>{" "}
          to the user's browser for a snappier experience.
          <br />
          <span className="text-count-blue">
            DuckDB Server Query Cache
          </span>{" "}
          included on Team and above can lead to further savings in compute.
        </p>
      );
    }
  };

  const upgradeNudge = () => {
    const upgrade = getUpgradeRecommendation();
    if (calculateTotalPrice() * 12 > 35000) {
      return (
        <div className="text-sm font-sans mb-4">
          <span className="text-count-blue">
            We should talk about Enterprise
          </span>{" "}
          so we give you the best value.
        </div>
      );
    }
    if (upgrade == null) {
      return null;
    }
    if (upgrade.extra > 0) {
      return (
        <div className="text-sm font-sans mb-4">
          Psst. You could get an extra{" "}
          <span className="text-count-blue">
            {upgrade.editors} editors, {upgrade.collaborators} collaborators,
            and well, a whole lot more
          </span>{" "}
          for only <span className="text-count-blue">${upgrade.extra} p/m</span>{" "}
          extra with{" "}
          <span className="text-count-blue capitalize">{upgrade.plan}</span>.
        </div>
      );
    } else if (upgrade.extra < 0) {
      return (
        <div className="text-sm font-sans mb-4">
          Look. You should upgrade to{" "}
          <span className="text-count-blue capitalize">{upgrade.plan}</span>.
          You'll get{" "}
          <span className="text-count-blue">
            much more Count for much less money.
          </span>
        </div>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="mx-auto font-sans">
      {/*<h1 className="text-6xl text-count-black mb-10 tracking-[-4px]"> */}
      <div className="flex flex-col lg:flex-row">
        <div className="mb-8 w-full lg:w-3/4 lg:pr-16">
          {/*<h2 className="text-xl mb-4">All plans include:</h2> */}
          <h3 className="h6">All plans include:</h3>
          <div className="flex flex-wrap gap-y-4 gap-x-2 mb-4">
            {plansData.baseFeatures.map((feature, index) => (
              <span
                key={index}
                className="py-2 px-4 bg-count-purple-150 text-count-blue rounded-full text-sm font-mono"
              >
                {feature}
              </span>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="">
              <div className="mb-8">
                {/* <h2 className="text-xl mb-4">What are you trying to do?</h2> */}
                <h3 className="h6">What are you trying to do?</h3>
                {/*<div className="grid grid-cols-1 lg:grid-cols-3 gap-4"> */}
                <div
                  class="grid grid-cols-3 gap-5 overflow-x-auto pb-4"
                  style="grid-template-columns: repeat(3, minmax(250px, 1fr));"
                >
                  {[plansData.pro, plansData.team, plansData.scale].map(
                    (plan) => (
                      <div
                        className={`flex flex-col justify-between border-1 rounded-lg p-6 cursor-pointer transition ${selectedPlan === plan.name.toLowerCase() ? "bg-count-purple-150 border-count-blue" : "border-count-grey"}`}
                        onClick={() =>
                          handlePlanSelect(plan.name.toLowerCase())
                        }
                      >
                        <div>
                          {/*<h4 className="text-base">{plan.name}</h4>*/}
                          <h4 className="text-size-large text-weight-semibold">
                            {plan.name}
                          </h4>
                          <div className="flex items-center mb-2">
                            {plan.name == "Team" && (
                              <span className="text-count-pink mr-1">↓</span>
                            )}
                            {plan.name == "Scale" && (
                              <span className="text-count-pink mr-1">
                                <sup>↓</sup>↓
                              </span>
                            )}

                            <div className="text-count-blue text-sm font-mono">
                              ${plan.pricePerEditor} per editor/month
                            </div>
                          </div>
                          <p className="text-count-black mb-4 text-sm font-mono">
                            {plan.description}
                          </p>
                        </div>
                        {plan.minSeats > 1 && (
                          <div className="text-sm">
                            <span className="inline-block font-mono rounded-full bg-count-grey text-count-black px-4 py-1">
                              Min. {plan.minSeats} seats
                            </span>
                          </div>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="mb-8">
                <div className="flex items-baseline justify-between flex-col lg:flex-row">
                  {/*<h2 className="text-xl mb-4">
                    How many editor seats do you need?
                    </h2> */}
                  <h3 className="h6">How many editor seats do you need?</h3>

                  <div className="text-sm mb-4 font-mono text-count-black">
                    +{plansData[selectedPlan].collaborators} collaborators who
                    can view & comment
                  </div>
                </div>

                <Slider
                  type="range"
                  min="1"
                  max="60"
                  value={seats}
                  onChange={(e) => handleSeatChange(e.target.value)}
                />
                {/*
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={seats}
                    onChange={(e) => handleSeatChange(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                      */}
              </div>

              <div className="mb-8">
                <div className="flex items-baseline flex-col lg:flex-row">
                  {/*                  <h2 className="text-xl mb-4 lg:mr-4 lg:w-1/3">
                    Save time and money with DuckDB
                    </h2>*/}
                  <h3 className="h6">Save time and money with DuckDB</h3>

                  {duckDbMessage()}
                </div>
              </div>

              <div className="hidden md:block">
                {/*<h2 className="text-xl mb-4">
                  Looking for something specific?
                  </h2>*/}
                <h3 className="h6">Looking for something specific?</h3>
                <div className="flex flex-wrap gap-y-4 gap-x-2">
                  {renderAdditionalFeatures()}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:w-1/4 sm:w-full]">
          <div className="border border-count-blue rounded-lg p-6 sticky top-[5rem]">
            <div className="text-count-blue text-sm mb-4 font-mono bg-count-grey px-4 py-2 inline-block rounded-full">
              YOUR PLAN
            </div>
            <div className="flex justify-between items-center mb-6">
              {/*<h2 className="text-3xl">{plansData[selectedPlan].name}</h2>*/}
              <h4 className="h6">{plansData[selectedPlan].name}</h4>
              <div className="text-2xl font-mono">
                {formatter.format(calculateTotalPrice())}/month
              </div>
            </div>

            {selectedPlan === "scale" && (
              <div className="text-sm font-mono mb-4">
                {formatter.format(calculateTotalPrice() * 12)} billed annually
              </div>
            )}

            {upgradeNudge()}

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between mb-2">
                <div>Editor seats</div>
                <div className="font-medium">{seats}</div>
              </div>
              <div className="flex justify-between mb-4">
                <div>Collaborator seats</div>
                <div className="font-medium">
                  {plansData[selectedPlan].collaborators}
                </div>
              </div>
            </div>

            <div className="mb-6">
              {/*                <h5 className="font-bold mb-2">Includes</h5>*/}
              <h5 className="h6">Includes</h5>
              <div className="space-y-2">
                {plansData[selectedPlan].featureList.map((feature, index) => (
                  <div key={index} className="flex justify-between">
                    <div>{feature}</div>
                    <div>
                      <svg
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20.3479 7.56384L9.7479 18.1638C9.65402 18.2585 9.52622 18.3117 9.3929 18.3117C9.25958 18.3117 9.13178 18.2585 9.0379 18.1638L3.6479 12.7738C3.55324 12.68 3.5 12.5522 3.5 12.4188C3.5 12.2855 3.55324 12.1577 3.6479 12.0638L4.3479 11.3638C4.44178 11.2692 4.56958 11.2159 4.7029 11.2159C4.83622 11.2159 4.96402 11.2692 5.0579 11.3638L9.3879 15.6938L18.9379 6.14384C19.1357 5.95205 19.4501 5.95205 19.6479 6.14384L20.3479 6.85384C20.4426 6.94772 20.4958 7.07552 20.4958 7.20884C20.4958 7.34216 20.4426 7.46995 20.3479 7.56384Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
                <div className="text-right">
                  <a
                    href="#compare"
                    className="text-count-blue hover:underline"
                  >
                    View all
                  </a>
                </div>
              </div>
            </div>

            {/*<button className="w-full py-3 bg-count-blue text-white font-mono rounded hover:bg-blue-700 transition shadow-[0_0_8px_2px_#00000014,inset_0_0_6px_4px_#6460ff]">
              Start 14 day trial
              </button> */}
            <a
              href="https://count.co/sign-up?trial=true"
              className="btn-primary w-button w-full"
            >
              Start 14 day trial
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
