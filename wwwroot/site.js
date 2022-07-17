let _currentScheme;
let _manualColorTheme = false;
let _saved_theme;
let _scrollToTopVisible = false;
let _throttleScrollHandlerId;

const lightDarkToggle = document.querySelector('#light-dark-toggle');
const lightDarkToggleIcon = document.querySelector('#light-dark-toggle-icon');
const scrollToTop = document.querySelector('#scroll-to-top');

function registerComponents() {
    const icon = customElements.get('tf-icon');
    if (icon) {
        return;
    }

    customElements.define('tf-icon', class extends HTMLElement { });
}
registerComponents();

function getPreferredColorScheme() {
    if (_manualColorTheme && _saved_theme) {
        return _saved_theme;
    }

    const local = localStorage.getItem('tavenem-theme');
    if (local) {
        const theme = parseInt(local);
        if (theme == 1 || theme == 2) {
            return theme;
        }
    }

    if (window.matchMedia) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 2;
        } else {
            return 1;
        }
    }

    return 1;
}

function setColorScheme(theme, manual) {
    if (manual) {
        _manualColorTheme = (theme != 0);
    } else {
        localStorage.removeItem('tavenem-theme');
        if (_manualColorTheme) {
            return;
        }
    }
    _saved_theme = theme;

    const preferred = getPreferredColorScheme();
    if (theme == 0) {
        theme = preferred;
    }
    _currentScheme = theme;

    if (theme == 2) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }

    if (theme == preferred) {
        localStorage.removeItem('tavenem-theme');
    } else if (manual) {
        localStorage.setItem('tavenem-theme', theme.toString());
    }

    lightDarkToggleIcon.innerHTML = theme == 2
        ? 'dark_mode'
        : 'light_mode';
}

function setPreferredColorScheme() {
    setColorScheme(getPreferredColorScheme());
}

if (window.matchMedia) {
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    colorSchemeQuery.addEventListener('change', setPreferredColorScheme);
}
_currentScheme = getPreferredColorScheme();
if (_currentScheme == 2) {
    setColorScheme(_currentScheme);
}

lightDarkToggle.addEventListener('click', () => {
    setColorScheme(_currentScheme == 2 ? 1 : 2, true);
});

scrollToTop.addEventListener('click', () => {
    const element = document.querySelector('#main-container');
    if (element instanceof HTMLElement) {
        element.scroll({
            top: 0,
            left: 0,
            behavior: "smooth",
        });
    }
});
function handleScroll(event) {
    try {
        const element = event.target;
        if (!(element instanceof HTMLElement)) {
            return;
        }
        const firstChild = element.firstElementChild;
        if (!firstChild) {
            return;
        }

        var topOffset = element.nodeName == "#document"
            ? firstChild.getBoundingClientRect().top * -1
            : element.scrollTop;

        if (topOffset >= 300 && !_scrollToTopVisible)
        {
            _scrollToTopVisible = true;
            scrollToTop.classList.remove('hidden');
        }
        else if (topOffset < 300 && _scrollToTopVisible)
        {
            _scrollToTopVisible = false;
            scrollToTop.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error in handleScroll: ', { error });
    }
}
scrollToTop.addEventListener('scroll', e => {
    clearTimeout(_throttleScrollHandlerId);

    _throttleScrollHandlerId = window.setTimeout(
        handleScroll.bind(this, e),
        100
    );
});