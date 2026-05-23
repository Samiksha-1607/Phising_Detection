"""URL feature extraction for phishing detection (21 features)."""

import re
from urllib.parse import urlparse

SUSPICIOUS_TLDS = {".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".pw"}
IP_PATTERN = re.compile(
    r"\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}"
    r"(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b"
)
SUSPICIOUS_URL_KEYWORDS = {
    "verify",
    "login",
    "signin",
    "secure",
    "account",
    "update",
    "confirm",
    "auth",
    "bank",
    "paypal",
    "amazon",
    "gift",
    "giftcard",
    "claim",
    "win",
    "winner",
    "prize",
    "free",
}
BRAND_TOKENS = {"paypal", "amazon", "google", "microsoft", "apple", "bank"}

FEATURE_NAMES = [
    "UsingIP",
    "PrefixSuffix-",
    "SubDomains",
    "HTTPS",
    "NonStdPort",
    "HTTPSDomainURL",
    "RequestURL",
    "AnchorURL",
    "LinksInScriptTags",
    "ServerFormHandler",
    "InfoEmail",
    "AbnormalURL",
    "WebsiteForwarding",
    "StatusBarCust",
    "DisableRightClick",
    "AgeofDomain",
    "DNSRecording",
    "WebsiteTraffic",
    "PageRank",
    "GoogleIndex",
    "StatsReport",
]


def _get_domain(url: str) -> str:
    try:
        parsed = urlparse(url if "://" in url else f"http://{url}")
        domain = parsed.netloc or parsed.path.split("/")[0]
        return domain.lower()
    except Exception:
        return ""


def _subdomain_score(domain: str) -> int:
    host = domain.split(":")[0]
    dot_count = host.count(".")
    if dot_count <= 1:
        return 1
    if dot_count == 2:
        return 0
    return -1


def extract_features(url: str) -> list[int]:
    url_lower = url.lower()
    domain = _get_domain(url)
    host_part = domain.split(":")[0]

    using_ip = -1 if IP_PATTERN.search(url) else 1
    prefix_suffix = -1 if "-" in host_part else 1
    sub_domains = _subdomain_score(host_part)
    https = 1 if url_lower.startswith("https://") else -1

    non_std_port = 1
    try:
        parsed = urlparse(url if "://" in url else f"http://{url}")
        if parsed.port and parsed.port not in (80, 443):
            non_std_port = -1
    except Exception:
        non_std_port = -1

    https_domain_url = -1 if "https" in host_part else 1
    request_url = 1
    anchor_url = -1 if "#" in url else 1
    links_in_script_tags = 1
    server_form_handler = 1
    info_email = -1 if "mailto:" in url_lower else 1
    abnormal_url = -1 if "@" in url else 1
    website_forwarding = -1 if url.count("//") > 2 else 1
    status_bar_cust = 1
    disable_right_click = 1

    age_of_domain = 1
    for tld in SUSPICIOUS_TLDS:
        if host_part.endswith(tld):
            age_of_domain = -1
            break

    dns_recording = -1 if using_ip == -1 else 1
    website_traffic = -1
    page_rank = -1
    google_index = 1
    stats_report = 1

    return [
        using_ip,
        prefix_suffix,
        sub_domains,
        https,
        non_std_port,
        https_domain_url,
        request_url,
        anchor_url,
        links_in_script_tags,
        server_form_handler,
        info_email,
        abnormal_url,
        website_forwarding,
        status_bar_cust,
        disable_right_click,
        age_of_domain,
        dns_recording,
        website_traffic,
        page_rank,
        google_index,
        stats_report,
    ]


def features_to_dict(feature_vector: list[int]) -> dict:
    return {name: value for name, value in zip(FEATURE_NAMES, feature_vector)}


def _contains_suspicious_keyword(url: str) -> bool:
    return any(keyword in url for keyword in SUSPICIOUS_URL_KEYWORDS)


def _normalize_spoof_domain(domain: str) -> str:
    return (
        domain
        .replace("0", "o")
        .replace("1", "l")
        .replace("3", "e")
        .replace("5", "s")
        .replace("4", "a")
    )


def _contains_brand_spoof(domain: str) -> bool:
    normalized = _normalize_spoof_domain(domain)
    return any(token in normalized for token in BRAND_TOKENS)


def is_suspicious_url(url: str) -> tuple[bool, list[str]]:
    url_lower = url.lower()
    domain = _get_domain(url)
    host = domain.split(":")[0]
    reasons = []

    if IP_PATTERN.search(url_lower):
        reasons.append("Raw IP address used in URL")

    if any(host.endswith(tld) for tld in SUSPICIOUS_TLDS):
        reasons.append("Suspicious top-level domain")

    if _contains_suspicious_keyword(url_lower):
        reasons.append("Phishing keywords found in URL")

    if "-" in host and host.count("-") >= 2:
        reasons.append("Multiple hyphens in domain")

    if _contains_brand_spoof(host) and any(host.endswith(tld) for tld in SUSPICIOUS_TLDS):
        reasons.append("Possible brand spoofing with suspicious TLD")

    if "gift" in host or "claim" in url_lower or "win" in url_lower:
        reasons.append("Promotional or prize language detected")

    return len(reasons) >= 2, reasons
