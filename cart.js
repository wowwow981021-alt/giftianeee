function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function getCoupon() {
  return JSON.parse(localStorage.getItem("coupon")) || null;
}

function saveCoupon(coupon) {
  if(coupon) {
    localStorage.setItem("coupon", JSON.stringify(coupon));
  } else {
    localStorage.removeItem("coupon");
  }
}

// 쿠폰 코드 검증 및 할인 정보 반환
function validateCoupon(code) {
  const coupons = {
    "WELCOME10": { discount: 10, type: "percent", name: "신규회원 10% 할인" },
    "SAVE5000": { discount: 5000, type: "fixed", name: "5,000원 할인" },
    "SUMMER20": { discount: 20, type: "percent", name: "여름 특가 20% 할인" },
    "TEST100": { discount: 100, type: "percent", name: "테스트 100% 할인" }
  };
  
  return coupons[code.toUpperCase()] || null;
}

function addToCart(name, price) {
  const cart = getCart();
  const existing = cart.find(item => item.name === name);
  if(existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  saveCart(cart);
  alert(`${name} 장바구니에 담겼습니다.`);
}

// 실시간 총액 계산 함수
function calculateTotal() {
  const cart = getCart();
  let subtotal = 0;
  
  cart.forEach(item => {
    subtotal += item.price * item.qty;
  });
  
  const coupon = getCoupon();
  let discount = 0;
  let discountText = "";
  
  if(coupon) {
    if(coupon.type === "percent") {
      discount = Math.floor(subtotal * coupon.discount / 100);
    } else {
      discount = Math.min(coupon.discount, subtotal);
    }
    discountText = coupon.name;
  }
  
  const total = Math.max(0, subtotal - discount);
  
  return {
    subtotal,
    discount,
    total,
    discountText,
    coupon
  };
}

// 총액 실시간 업데이트
function updateTotal() {
  const totals = calculateTotal();
  const totalDiv = document.getElementById("cartTotal");
  const discountDiv = document.getElementById("cartDiscount");
  const couponDiv = document.getElementById("couponStatus");
  
  if(!totalDiv) return;
  
  let html = "";
  
  if(totals.subtotal > 0) {
    html += `<div style="margin: 10px 0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span>상품 금액:</span>
        <span>₩${totals.subtotal.toLocaleString()}</span>
      </div>`;
    
    if(totals.discount > 0) {
      html += `<div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #4CAF50;">
        <span>할인 (${totals.discountText}):</span>
        <span>-₩${totals.discount.toLocaleString()}</span>
      </div>`;
    }
    
    html += `<div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 2px solid #333; font-size: 1.2em; font-weight: bold;">
      <span>총 결제 금액:</span>
      <span>₩${totals.total.toLocaleString()}</span>
    </div>`;
  }
  
  totalDiv.innerHTML = html;
  
  // 할인 정보 표시
  if(discountDiv) {
    if(totals.discount > 0) {
      discountDiv.style.display = "block";
      discountDiv.innerHTML = `적용된 할인: ${totals.discountText} (-₩${totals.discount.toLocaleString()})`;
    } else {
      discountDiv.style.display = "none";
    }
  }
  
  // 쿠폰 상태 표시
  if(couponDiv) {
    if(totals.coupon) {
      couponDiv.innerHTML = `<span style="color: #4CAF50;">✓ ${totals.coupon.name} 적용됨</span> <button onclick="removeCoupon()" style="margin-left: 10px; padding: 5px 10px; font-size: 0.9em;">제거</button>`;
    } else {
      couponDiv.innerHTML = "";
    }
  }
}

// 수량 변경 (실시간 반영)
function updateQty(index, newQty) {
  const cart = getCart();
  if(newQty < 1) {
    newQty = 1;
  }
  cart[index].qty = Number(newQty);
  saveCart(cart);
  
  // 개별 상품 금액 업데이트
  updateItemTotal(index);
  
  // 총액 실시간 업데이트
  updateTotal();
}

// 개별 상품 금액 실시간 업데이트
function updateItemTotal(index) {
  const cart = getCart();
  const item = cart[index];
  const itemTotal = item.price * item.qty;
  const itemTotalElement = document.getElementById(`itemTotal_${index}`);
  
  if(itemTotalElement) {
    itemTotalElement.textContent = `₩${itemTotal.toLocaleString()}`;
  }
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

// 쿠폰 적용
function applyCoupon() {
  const couponInput = document.getElementById("couponCode");
  if(!couponInput) return;
  
  const code = couponInput.value.trim();
  if(!code) {
    alert("쿠폰 코드를 입력해주세요.");
    return;
  }
  
  const coupon = validateCoupon(code);
  if(coupon) {
    saveCoupon(coupon);
    couponInput.value = "";
    updateTotal();
    alert(`쿠폰이 적용되었습니다: ${coupon.name}`);
  } else {
    alert("유효하지 않은 쿠폰 코드입니다.");
  }
}

// 쿠폰 제거
function removeCoupon() {
  saveCoupon(null);
  updateTotal();
  alert("쿠폰이 제거되었습니다.");
}

function renderCart() {
  const cart = getCart();
  const cartDiv = document.getElementById("cartItems");
  if(!cartDiv) return;
  
  cartDiv.innerHTML = "";
  let total = 0;

  if(cart.length === 0){
    cartDiv.innerHTML = "<p>장바구니가 비었습니다.</p>";
    const totalDiv = document.getElementById("cartTotal");
    if(totalDiv) totalDiv.innerHTML = "";
    return;
  }

  cart.forEach((item, i) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    
    cartDiv.innerHTML += `
      <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin-bottom: 10px; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 5px;">${item.name}</div>
          <div style="color: #666; font-size: 0.9em;">₩${item.price.toLocaleString()} × 
            <input type="number" 
                   value="${item.qty}" 
                   min="1" 
                   style="width:60px; padding: 5px; text-align: center; border: 1px solid #ddd; border-radius: 4px;"
                   oninput="updateQty(${i}, this.value)"
                   onchange="updateQty(${i}, this.value)">
            = <span id="itemTotal_${i}" style="font-weight: bold; color: #333;">₩${itemTotal.toLocaleString()}</span>
          </div>
        </div>
        <button onclick="removeItem(${i})" style="margin-left: 10px; padding: 8px 15px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">삭제</button>
      </div>
    `;
  });
  
  // 총액 업데이트
  updateTotal();
}
