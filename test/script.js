document.addEventListener("DOMContentLoaded", function() {
    //Create/add stars to layers
    const starLayers = document.querySelectorAll('.star-layer');
    
    starLayers.forEach(layer => {
      for (let i = 0; i < 60; i++) {
        const star = document.createElement('li');
        star.className = 'star';
        layer.appendChild(star);
      }
    })
    const stars = document.querySelectorAll('.star');

     //Randomize star position
    stars.forEach(star => {
        star.style.top = Math.floor(Math.random() * 99) + "%";
        star.style.left = Math.floor(Math.random() * 99) + "%";
    })

    //Randomize exhaust fume position
    const fumes = document.querySelectorAll('.smoke-cloud');

    fumes.forEach(cloud => {
        cloud.style.top = Math.floor(Math.random() * 50) + "%";
        cloud.style.left = Math.floor(Math.random() * 101) + "%";
    })

    setInterval(function() {

        fumes.forEach(cloud => {
            cloud.style.display = "none";
            cloud.style.top = Math.floor(Math.random() * 50) + "%";
            cloud.style.left = Math.floor(Math.random() * 101) + "%";
            cloud.style.display = "block";
        })
    }, 2950);
    
    const $starLayers = document.getElementsByClassName("star-layer");
    const $body = document.getElementsByTagName("body");
    const $rocket = document.getElementById("svg-rocket");
    const $moon = document.getElementById("moon");
    const $fire = document.getElementById("fire");
    const $trail = document.getElementById("trail");
    const $galaxy = document.getElementById("svg-galaxy");
    const $flash = document.getElementById("flash");
    const $milestones = document.getElementById("milestone-wrapper");
    const $title = document.getElementById("title");
    const $undraw = document.getElementById("undraw");
    const $options = document.querySelectorAll(".planet");

    const tl = new TimelineLite({});
    tl.to($fire, 0.3, {
            opacity: 0,
            repeat: 3
        })
        .to($trail, 0.1, {
            opacity: 1
        })
        .call(function() {
            $rocket.classList.remove("rocket-hover");
            $rocket.classList.add("rocket-shake");
        })
        .to($rocket, 1, {
            bottom: 150,
            delay: 0.6
        })
        .to($trail, 0.5, {
            height: 400
        }, "-=1")
        .to($moon, 3, {
            transform: "scale(7)",
            top: "50%",
            right: -1200,
            ease: Power0.easeIn,
            delay: 2
        }, "-=2")
        .to($galaxy, 2, {
            transform: "scale(1)",
            left: -400,
            top: "40%"
        }, "-=1")
        .to($rocket, 0.5, {
            bottom: "120%"
        }, "-=0.5")
        .to($trail, 0.5, {
            height: 1800
        }, "-=0.5")
        .to($flash, 0.3, {
            width: 10,
            height: "100%"
        }, "-=0.2")
        .to($flash, 0.3, {
            width: "100%",
            height: "100%"
        })
        .call(function() {
            document.getElementById('space').remove();
            $("html").css("overflow", "auto");
            $("#flash").remove();
        })
        .to($milestones, 2, {
            opacity: 1,
            display: "flex",
        })
        .to($title, 1, {
            opacity: 1
        }, "-=1")
          .staggerTo($options, .6, {transform: "scale(1)", opacity: 1}, 0.2, "-=1")

    $(".planet-wrapper").click(function() {
        $(".planet-wrapper").addClass("choice-selected");
        $(".planet-wrapper").removeClass("current-choice");
        $(this).addClass("current-choice");
        $("#milestone-wrapper").addClass("choice-selected");
        var tlData = $(this).data("tl");
        var data = window[tlData];
        $("#tl").html("");
        $("#tl").addClass("tl-show");
        data.forEach(function(item) {
            var date = item.date ? "<h2 class='date-line'>" + item.date + "</h2>" : "";
            $("#tl").append("<div class='timeline-item'><div class='timeline-icon'><i class='fas fa-star'></i></div><div class='timeline-content'>" + date + "<p>" + item.content + "</p></div></div>");
        });
        $("#tl").append('<div class="scroll-top"><i class="fas fa-chevron-up"></i></div>');
      $(".scroll-top").click(function() {
        window.scrollTo(0,0);
      })
        const timelineItems = $('.timeline-item');
        timelineItems.each(function(index) {
          if (index > 0) {
            if ($(this).offset().top > $(window).scrollTop() + $(window).height() * 0.9) {
                $(this).find('.timeline-content, .timeline-icon').addClass('hidden');
            }
          }
            
        });

        $("#tl").hide().fadeIn();

        $(window).on('scroll', function() {
            timelineItems.each(function() {
                if ($(this).offset().top <= $(window).scrollTop() + $(window).height() * 0.9 && $(this).find('.timeline-content, .timeline-icon').hasClass('hidden')) {
                    $(this).find('.timeline-content, .timeline-icon').removeClass('hidden').addClass('bounce');
                }
            });
        });

    })

});

var demos = [{
        date: "March 25, 2018",
        content: "Presentation: Perspective on Technology-Based Solutions National Association of Workforce Innovation – The Forum 2018"
    },
    {
        date: "April 12, 2018",
        content: "Demonstration to Regional IT Directors"
    },
    {
        date: "May 14, 2018",
        content: "Demonstration at the Committee Meeting"
    },
    {
        date: "June 8, 2018",
        content: "Demonstration to Central Staff"
    },
    {
        date: "June 21, 2018",
        content: "Demonstration to West Staff"
    },
    {
        date: "July 12, 2018",
        content: "Demonstration to Board of Directors"
    },
    {
        date: "August 2, 2018",
        content: "CFO addressed project during opening."
    },
    {
        date: "",
        content: "Demonstration at Innovation Expo"
    },
    {
        date: "August 7, 2018",
        content: "Demonstration for County Progress Planning"
    },
];

var development = [{
        date: "December 26, 2017",
        content: "CMS installation"
    },
    {
        date: "January 10, 2018",
        content: "Data Manager"
    },
    {
        date: "February 12, 2018",
        content: "Initial search feature"
    },
    {
        date: "March 12, 2018",
        content: "Site migration to production"
    },
    {
        date: "March 14, 2018",
        content: "Optimized search algorithm"
    },
    {
        date: "May 15, 2018",
        content: "Initial contact form"
    },
    {
        date: "June 1, 2018",
        content: "First version of new site"
    },
    {
        date: "June 14, 2018",
        content: "New marketing materials to include business card, rack cards, and quick reference guide"
    },
    {
        date: "August 8, 2018",
        content: "Redesign"
    },
    {
        date: "August 23, 2018",
        content: "Inquiry system"
    },
    {
        date: "August 27, 2018",
        content: "100 Day Update Report"
    },
];

var rollout = [
      {
        date: "April 12, 2018",
        content: "Demonstration to IT Directors"
    },
    {
        date: "May 14, 2018",
        content: "Demonstration at Committee Meeting"
    },
      {
        date: "March 14, 2019",
        content: "Regional Webcasts"
    },
        {
        date: "May 1, 2019",
        content: "Region 6 Adoption"
    },
        {
        date: "May 14, 2018",
        content: "Region 11 Adoption"
    },
  {
        date: "June 1, 2019",
        content: "Region 22 Adoption"
    },
        {
        date: "June 10, 2018",
        content: "Feature update statewide webcasts"
    },
]