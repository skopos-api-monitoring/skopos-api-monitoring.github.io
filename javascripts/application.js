/* global document, window, hljs, $ */

document.addEventListener('DOMContentLoaded', () => {
  const skoposWhite = '#FFFFFF';
  const skoposOrange = '#E28027';
  const skoposBlue = '#2E939E';
  const skoposRed = '#D3593D'
  const main = document.querySelector('main');
  const ourTeam = document.querySelector('#our-team');
  const $caseStudyNav = $('#case-study nav');
  const caseStudyNav = document.querySelector('#case-study nav');
  const $sideNavLogo = $('#side-nav');
  const caseStudyNavUl = document.querySelector('#case-study nav ul');
  const mobileCaseStudyNavUl = document.querySelector('#case-study-mobile');
  const $toTop = $('#toTop-logo');

  const hamburgerImg = document.querySelector('#hamburger svg');
  const hamburger = document.querySelector('#hamburger');
  const xButton = document.querySelector('#x');
  const menu = document.querySelector('.menu');
  const headerLogo = document.querySelector('header > nav img');
  const toggleExpand = (element) => element.classList.toggle('expand');
  const hide = (element) => element.classList.add('hidden');
  const show = (element) => element.classList.remove('hidden');

  hamburger.onclick = (e) => {
    hide(hamburgerImg);
    toggleExpand(hamburger);
    show(xButton);

    const scrollY = document.scrollingElement.style.getPropertyValue('--scroll-y');
    const scrollingElement = document.scrollingElement;
    scrollingElement.style.position = 'fixed';
    scrollingElement.style.top = `-${scrollY}`;

    setTimeout(() => {
      toggleExpand(hamburger);
      show(menu)
    }, 250);
  }

  menu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      const scrollingElement = document.scrollingElement;
      scrollingElement.style.position = '';
      scrollingElement.style.top = '';
      handleCaseStudyNav()

      setTimeout(() => {
        hide(xButton)
        hide(menu)
        show(hamburgerImg)
      }, 150)
    }
  })

  xButton.onclick = (e) => {
    const xButton = e.currentTarget;
    hide(xButton);

    const scrollingElement = document.scrollingElement;
    const scrollY = scrollingElement.style.top;
    scrollingElement.style.position = '';
    scrollingElement.style.top = '';
    window.scrollTo(0, parseInt(scrollY || '0') * -1);

    hide(menu);
    show(hamburgerImg);
  }

  window.addEventListener('scroll', () => {
    document.scrollingElement.style.setProperty('--scroll-y', `${window.scrollY}px`);
  });

  $toTop.on('click', (e) => {
    e.preventDefault();
    $([document.documentElement, document.scrollingElement]).animate(
      {
        scrollTop: $('#introduction').offset().top,
      },
      500,
    );
  });

  const getScrollPosition = () => window.scrollY;
  const getWindowHeight = () => window.innerHeight;
  const getWindowWidth = () => window.innerWidth;

  const snakeCaseify = (text) => text.toLowerCase().split(/ +|\//).join('-').replace(/\.|-{2,}/g, '-');

  const removeAmpersand = (text) => text.replace('&', '');

  let lastH2Id;
  let lastH3Id;
  const linkableHeaders = [...document.querySelectorAll('#case-study h2, #case-study h3, #case-study h4, #our-team h1')].map((el) => {
    if (el.nodeName === 'H2') {
      lastH2Id = el.id;
    }

    if (el.nodeName === 'H3') {
      lastH3Id = el.id
    }

    let elObject = {
      el,
      type: el.nodeName,
      text: el.textContent.replace(/^.*\) /, ''),
      parentId: el.nodeName === 'H4' ? lastH3Id : lastH2Id
    }
    return elObject
  });

  const paddingAllowanceAboveHeading = 30;

  const getCaseStudyHeadingPositions = () =>
    linkableHeaders.reduce((obj, headerObj) => {
      const selector = `#${snakeCaseify(removeAmpersand(headerObj.text))}`;
      const header = document.querySelector(selector);
      if (!header) return obj;
      const position =
        getScrollPosition() + header.getBoundingClientRect().top - paddingAllowanceAboveHeading;
      obj[`${selector}-nav`] = {
        position,
        headerData: headerObj
      };

      return obj;
    }, {});

  const highlightSection = (li, a) => {
    li.style.listStyle = 'disc';

    li.style.color = skoposRed;
    a.style.color = skoposRed;
  };

  const mobileCaseStudyLinks = [];

  (function () {
    let lastH2Id;

    linkableHeaders.forEach((headerObj) => {
      if (headerObj.type === 'H2') {
        lastH2Id = headerObj.el.id;
      } else if (headerObj.type === 'H3') {
        lastH3Id = headerObj.el.id
        headerObj.parentId = lastH2Id
      } else {
        headerObj.parentId = lastH2Id;
      }

      const li = document.createElement('li');
      li.id = snakeCaseify(`${removeAmpersand(headerObj.text).replace('!', '').toLowerCase()}-nav`);
      li.dataset['parentHeaderId'] = headerObj.parentId;
      li.dataset['tagType'] = headerObj.el.nodeName;

      const a = document.createElement('a');
      a.href = snakeCaseify(`#${removeAmpersand(headerObj.el.id).replace('!', '')}`);
      a.textContent = headerObj.text.toUpperCase();
      a.className = 'case-study-anchor';

      li.appendChild(a);
      caseStudyNavUl.appendChild(li);

      if (headerObj.type === 'H2') {
        const li2 = document.createElement('li');
        li2.id = snakeCaseify(
          `mobile-${removeAmpersand(headerObj.text).replace('!', '').toLowerCase()}-nav`,
        );
        li2.dataset['parentHeaderId'] = lastH2Id;
        li2.dataset['tagType'] = headerObj.el.nodeName;

        const a2 = document.createElement('a');
        a2.href = snakeCaseify(`#${removeAmpersand(headerObj.text).replace('!', '')}`);
        a2.textContent = headerObj.text.toUpperCase();

        mobileCaseStudyLinks.push(a2);
        li2.appendChild(a2);
        mobileCaseStudyNavUl.appendChild(li2);
      }

      headerObj.navEl = li;
    });
  }());

  const handleCaseStudyNavStyles = () => {
    const positions = getCaseStudyHeadingPositions();
    const positionValues = Object.values(positions);
    const mobileCaseStudyNav = document.querySelector('#case-study-mobile');
    const position = getScrollPosition();

    const currentParent = document.querySelector('nav li.active-parent');
    const currentChildren = document.querySelectorAll('nav li.active-child');
    let newParentId;

    positionValues.forEach((_, i) => {
      const currentData = positionValues[i].headerData;
      const li = currentData.navEl;
      const a = li.getElementsByTagName('a')[0];
      const currPosition = i > 0 ? positionValues[i].position : 0;
      const nextPositionIdx = i + 1;
      const nextPosition =
        (positionValues[nextPositionIdx] &&
          positionValues[nextPositionIdx].position) || 999999;
      const windowPositionIsAtLi = position >= currPosition && position < nextPosition;

      if (windowPositionIsAtLi && !mobileCaseStudyNav.contains(li)) {
        highlightSection(li, a);

        newParentId = currentData.parentId;
      } else {
        if (li.getAttribute('style')) li.removeAttribute('style');
        if (a.getAttribute('style')) a.removeAttribute('style');
      }
    });

    if (currentParent) {
      currentParent.classList.remove('active-parent');
    }

    currentChildren.forEach(child => child.classList.remove('active-child'));

    newActive = document.querySelectorAll(`[data-parent-header-id="${newParentId}"]`)
    newActive.forEach(el => {
      el.classList.add('active-child');
    });
  };

  const handleCaseStudyNav = () => {
    const position = getScrollPosition();
    const ourTeamPosition = position + ourTeam.getBoundingClientRect().top;
    const mainPosition = position + main.getBoundingClientRect().top;
    const withinCaseStudy =
      position >= mainPosition && position < ourTeamPosition - getWindowHeight();

    if (getWindowHeight() < 500 || getWindowWidth() < 1100) {
      $sideNavLogo.stop(true, true).css('display', 'none');
      $caseStudyNav.stop(true, true).css('display', 'none');
    } else if (withinCaseStudy) {
      $sideNavLogo.fadeIn(800);
      $caseStudyNav.fadeIn(800);
      $toTop.fadeIn(800);

      handleCaseStudyNavStyles();
    } else {
      $sideNavLogo.stop(true, true).css('display', 'none');
      $caseStudyNav.stop(true, true).css('display', 'none');
      $toTop.stop(true, true).css('display', 'none');
    }

    if (getWindowHeight() < 500) {
      $toTop.stop(true, true).css('display', 'none');
    } else if (withinCaseStudy) {
      $toTop.fadeIn(800);
    } else {
      $toTop.stop(true, true).css('display', 'none');
    }
  };

  document.addEventListener('scroll', () => handleCaseStudyNav());

  window.addEventListener('resize', () => handleCaseStudyNav());

  caseStudyNav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      console.log(e.target)
      e.preventDefault();
      const positions = getCaseStudyHeadingPositions();
      const positionKey = `#${snakeCaseify(e.target.text)}-nav`;
      console.log(positions, positionKey, 'event listener')
      const newScrollPosition = positions[positionKey].position;
      window.scrollTo(0, newScrollPosition + 5);
    }
  });

  hljs.initHighlightingOnLoad();
});
